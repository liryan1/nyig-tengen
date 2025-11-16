import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";
import {
  ChallengeAttemptStatus,
  ChallengeLeaderboardPeriod,
} from "@prisma/client";
import { getPeriodStart, isBetterScore } from "@/lib/challenge";
import { logStack } from "@/lib/error";

type Params = { params: Promise<{ attemptId: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const [session, { attemptId }, { score, timeSpentMs }] = await Promise.all([
      await getServerSession(authOptions),
      params,
      req.json(),
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (
      typeof score !== "number" ||
      score <= 0 ||
      typeof timeSpentMs !== "number" ||
      timeSpentMs <= 0
    ) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const attempt = await db.challengeAttempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) {
      return NextResponse.json(
        { message: "Attempt not found" },
        { status: 404 },
      );
    }

    if (
      attempt.userId !== userId ||
      attempt.status !== ChallengeAttemptStatus.RUNNING
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Update the attempt data and records for all periods in one transaction
    const periods = Object.values(ChallengeLeaderboardPeriod);
    const now = new Date();

    const records = await db.$transaction(async (tx) => {
      await tx.challengeAttempt.update({
        where: { id: attemptId },
        data: {
          status: ChallengeAttemptStatus.COMPLETED,
          score,
          timeSpentMs,
          completedAt: now,
        },
      });
      // Update or create records for each period
      const recordPromises = periods.map(async (period) => {
        const periodStart = getPeriodStart(period, now);

        // Check if a record exists for this user/period/periodStart
        const existingRecord = await tx.challengeRecord.findUnique({
          where: {
            userId_period_periodStart: {
              userId,
              period,
              periodStart,
            },
          },
        });

        const isNewRecord = !existingRecord;
        const isBetter = existingRecord
          ? isBetterScore(
              score,
              timeSpentMs,
              existingRecord.problemsCorrect,
              existingRecord.timeSpentMs,
            )
          : false;

        // Always upsert to increment completionCount
        return tx.challengeRecord.upsert({
          where: {
            userId_period_periodStart: {
              userId,
              period,
              periodStart,
            },
          },
          create: {
            userId,
            period,
            periodStart,
            problemsCorrect: score,
            timeSpentMs,
            attemptId,
            completionCount: 1,
          },
          update: {
            // Only update score/time if it's better
            ...(isBetter && {
              problemsCorrect: score,
              timeSpentMs,
              attemptId,
            }),
            // Always increment completion count
            completionCount: (existingRecord?.completionCount ?? 0) + 1,
          },
        });
      });

      return Promise.all(recordPromises);
    });

    const allTimeRecord = records.find(
      (record) => record.period === ChallengeLeaderboardPeriod.ALLTIME,
    );

    return NextResponse.json({
      problemsCorrect: allTimeRecord?.problemsCorrect ?? score,
      timeSpentMs: allTimeRecord?.timeSpentMs ?? timeSpentMs,
    });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred while submitting the challenge" },
      { status: 500 },
    );
  }
}
