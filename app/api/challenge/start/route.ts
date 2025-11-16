import { authOptions } from "@/app/api/auth/authOptions";
import { getRandomProblems } from "@/lib/challenge";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import {
  ChallengeAttemptStatus,
  ChallengeLeaderboardPeriod,
} from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // End any existing active sessions for this user
    await db.challengeAttempt.updateMany({
      where: {
        userId,
        status: ChallengeAttemptStatus.RUNNING,
      },
      data: {
        status: ChallengeAttemptStatus.QUIT,
      },
    });

    const problems = await getRandomProblems();

    const createdAttempt = await db.challengeAttempt.create({
      data: {
        userId,
      },
      select: {
        id: true,
      },
    });

    const personalBest = await db.challengeRecord.findFirst({
      where: {
        userId,
        period: ChallengeLeaderboardPeriod.ALLTIME,
      },
      select: {
        problemsCorrect: true,
        timeSpentMs: true,
      },
    });

    return NextResponse.json(
      { attemptId: createdAttempt.id, problems, personalBest },
      { status: 201 },
    );
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred while starting the challenge" },
      { status: 500 },
    );
  }
}
