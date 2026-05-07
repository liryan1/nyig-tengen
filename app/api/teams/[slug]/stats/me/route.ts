import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";
import { SubmissionStatus } from "@prisma/client";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const [session, { slug }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const team = await db.team.findUnique({
      where: { slug },
      select: {
        teamProblems: { select: { problemNum: true } },
        teamProblemSets: { select: { problemSetNum: true } },
      },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const teamProblemNums = team.teamProblems.map((tp) => tp.problemNum);
    const teamPSetNums = team.teamProblemSets.map((tps) => tps.problemSetNum);

    const [solvedCount, completedSets] = await Promise.all([
      db.submission.count({
        where: {
          userId,
          status: SubmissionStatus.solved,
          problemNum: { in: teamProblemNums },
        },
      }),
      db.problemSetProgress.count({
        where: {
          userId,
          status: "completed",
          problemSetNum: { in: teamPSetNums },
        },
      }),
    ]);

    // Get top ranked set for this user in this team
    const topRankedSet = await db.problemSetLeaderboardEntry.findFirst({
      where: {
        userId,
        problemSetNum: { in: teamPSetNums },
      },
      orderBy: {
        score: "desc",
      },
      include: {
        problemSet: {
          select: { name: true },
        },
      },
    });

    // In a real scenario, we'd calculate the rank among all users for that specific problemSetNum.
    // For simplicity in MVP, we just return the best score's pset name.
    // If we wanted the actual rank:
    let rank = 0;
    if (topRankedSet) {
      const betterEntries = await db.problemSetLeaderboardEntry.count({
        where: {
          problemSetNum: topRankedSet.problemSetNum,
          OR: [
            { score: { gt: topRankedSet.score } },
            {
              score: topRankedSet.score,
              durationMs: { lt: topRankedSet.durationMs },
            },
          ],
        },
      });
      rank = betterEntries + 1;
    }

    return NextResponse.json(
      {
        problemsSolved: solvedCount,
        totalTeamProblems: teamProblemNums.length,
        setsCompleted: completedSets,
        totalTeamSets: teamPSetNums.length,
        topRankedSet: topRankedSet
          ? {
              name: topRankedSet.problemSet.name,
              rank: rank,
            }
          : null,
      },
      { status: 200 },
    );
  } catch (e) {
    logStack(e);
    return NextResponse.json(
      { message: "Failed to get team stats" },
      { status: 500 },
    );
  }
}
