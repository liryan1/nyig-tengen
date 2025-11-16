import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ChallengeLeaderboardPeriod } from "@prisma/client";
import { getPeriodStart } from "@/lib/challenge";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const period =
      (searchParams.get("p") as ChallengeLeaderboardPeriod) || "ALLTIME";

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const now = new Date();
    const periodStart = getPeriodStart(period, now);

    // Get top 10 entries
    const topEntries = await db.challengeRecord.findMany({
      where: {
        period,
        periodStart,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ problemsCorrect: "desc" }, { timeSpentMs: "asc" }],
      take: 10,
    });

    // Get user's personal best
    const userBest = await db.challengeRecord.findUnique({
      where: {
        userId_period_periodStart: {
          userId: session.user.id,
          period,
          periodStart,
        },
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Calculate user's rank if not in top 10
    let userRank = null;
    if (
      userBest &&
      !topEntries.find((entry) => entry.userId === session.user.id)
    ) {
      const betterCount = await db.challengeRecord.count({
        where: {
          period,
          periodStart,
          OR: [
            { problemsCorrect: { gt: userBest.problemsCorrect } },
            {
              problemsCorrect: userBest.problemsCorrect,
              timeSpentMs: { lt: userBest.timeSpentMs },
            },
          ],
        },
      });
      userRank = betterCount + 1;
    }

    return NextResponse.json({
      period,
      topEntries: topEntries.map((entry, index) => ({
        rank: index + 1,
        user: entry.user,
        problemsCorrect: entry.problemsCorrect,
        timeSpentMs: entry.timeSpentMs,
        completedAt: entry.updatedAt,
        completionCount: entry.completionCount,
      })),
      userEntry: userBest
        ? {
            rank:
              userRank ||
              topEntries.findIndex((e) => e.userId === session.user.id) + 1,
            user: userBest.user,
            problemsCorrect: userBest.problemsCorrect,
            timeSpentMs: userBest.timeSpentMs,
            completedAt: userBest.updatedAt,
            completionCount: userBest.completionCount,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}
