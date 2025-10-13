import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { ProblemOrderItem } from "@/lib/rtk/slices/problemSets";
import { ProgressStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ num: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const [session, { num }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    const userId = session?.user?.id;

    const problemSet = await db.problemSet.findUnique({
      where: { num },
      select: {
        name: true,
        description: true,
        problemCount: true,
        averageRank: true,
        createdAt: true,
        author: { select: { id: true, name: true, role: true } },
        problemSetProblems: { select: { problem: true, position: true } },
        problemSetStats: { select: { views: true, completed: true } },
        problemSetLikes: { select: { userId: true } },
        problemSetStars: { select: { userId: true } },
        problemSetProgresses: userId
          ? {
              where: {
                userId,
                OR: [
                  { status: ProgressStatus.inprogress },
                  { status: ProgressStatus.completed },
                ],
              },
              select: { id: true, problemOrder: true, status: true },
            }
          : false,
      },
    });

    if (!problemSet) {
      return NextResponse.json("Problem set not found", { status: 404 });
    }

    // Parse leaderboard flag
    const search = new URL(req.url).searchParams;
    const wantLeaderboard = ["1", "true", "yes"].includes(
      (search.get("leaderboard") ?? "").toLowerCase(),
    );

    // Conditionally compute leaderboard: shortest (updatedAt - createdAt)
    let leaderboard:
      | Array<{
          user: { id: string; name: string | null };
          startedAt: Date;
          completedAt: Date;
          durationMs: number;
        }>
      | undefined;

    if (wantLeaderboard) {
      const completions = await db.problemSetProgress.findMany({
        where: { problemSetNum: num, status: ProgressStatus.completed },
        select: {
          userId: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, name: true } },
        },
        // no orderBy needed for correctness since we compute min in-code
        take: 2000, // safety upper bound; adjust as needed
      });

      const bestByUser = new Map<
        string,
        {
          user: { id: string; name: string | null };
          startedAt: Date;
          completedAt: Date;
          durationMs: number;
        }
      >();

      for (const c of completions) {
        const durationMs = Math.max(
          0,
          c.updatedAt.getTime() - c.createdAt.getTime(),
        );
        const prev = bestByUser.get(c.userId);
        if (!prev || durationMs < prev.durationMs) {
          bestByUser.set(c.userId, {
            user: c.user,
            startedAt: c.createdAt,
            completedAt: c.updatedAt,
            durationMs,
          });
        }
      }

      leaderboard = Array.from(bestByUser.values())
        .sort((a, b) => a.durationMs - b.durationMs)
        .slice(0, 50);
    }

    const problems = problemSet.problemSetProblems.map((psp) => ({
      num: psp.problem.num,
      rank: psp.problem.rank,
      initial: psp.problem.initial,
      position: psp.position,
    }));

    const userLiked = problemSet.problemSetLikes.some(
      (l) => l.userId === userId,
    );
    const userStarred = problemSet.problemSetStars.some(
      (s) => s.userId === userId,
    );

    const userProgress = problemSet.problemSetProgresses?.find(
      (psp) => psp.status === "inprogress",
    );
    const userCompletions = problemSet.problemSetProgresses?.filter(
      (psp) => psp.status === "completed",
    )?.length;

    const order = userProgress?.problemOrder as ProblemOrderItem[] | undefined;
    if (order) {
      problems.sort((a, b) => {
        const ai = order.findIndex((it) => it.problemNum === a.num);
        const bi = order.findIndex((it) => it.problemNum === b.num);
        return ai - bi;
      });
    } else {
      problems.sort((a, b) => a.position - b.position);
    }

    return NextResponse.json(
      {
        num,
        name: problemSet.name,
        description: problemSet.description,
        problemCount: problemSet.problemCount,
        averageRank: problemSet.averageRank,
        completedCount: problemSet.problemSetStats?.completed,
        views: problemSet.problemSetStats?.views,
        likes: problemSet.problemSetLikes.length,
        userLiked,
        userStarred,
        author: problemSet.author,
        problems,
        userProgress,
        userCompletions,
        createdAt: problemSet.createdAt,
        ...(wantLeaderboard ? { leaderboard } : {}),
      },
      { status: 200 },
    );
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
