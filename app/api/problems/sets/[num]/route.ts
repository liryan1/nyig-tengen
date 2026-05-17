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
        problemSetStats: {
          select: { views: true, completed: true, likes: true, stars: true },
        },
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

    const [userLike, userStar] = await Promise.all([
      userId
        ? db.problemSetLike.findUnique({
            where: { userId_problemSetNum: { userId, problemSetNum: num } },
          })
        : null,
      userId
        ? db.problemSetStar.findUnique({
            where: { userId_problemSetNum: { userId, problemSetNum: num } },
          })
        : null,
    ]);

    // Return problem set leaderboard if query parameter is true
    const search = new URL(req.url).searchParams;
    const wantLeaderboard = ["1", "true", "yes"].includes(
      (search.get("leaderboard") ?? "").toLowerCase(),
    );

    let leaderboard;
    try {
      leaderboard = wantLeaderboard
        ? await db.problemSetLeaderboardEntry.findMany({
            where: { problemSetNum: num },
            select: {
              user: { select: { id: true, name: true } },
              score: true,
              completedAt: true,
              durationMs: true,
              completionCount: true,
            },
            orderBy: [
              { score: "desc" }, // First by score descending
              { durationMs: "asc" }, // Then by duration ascending
            ],
            take: 50,
          })
        : undefined;
    } catch (error) {
      logStack(error);
      console.warn(
        "Failed to fetch leaderboard, gracefully returning problem set without leaderboard",
      );
    }

    const problems = problemSet.problemSetProblems.map((psp) => ({
      num: psp.problem.num,
      rank: psp.problem.rank,
      initial: psp.problem.initial,
      position: psp.position,
    }));

    const userLiked = !!userLike;
    const userStarred = !!userStar;

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
        likes: problemSet.problemSetStats?.likes || 0,
        userLiked,
        userStarred,
        author: problemSet.author,
        problems,
        userProgress,
        userCompletions,
        userCompleted: userCompletions > 0,
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

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const [session, { num }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    const userId = session?.user?.id;
    const role = session?.user?.role;

    if (!userId || !role) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const problemSet = await db.problemSet.findUnique({
      where: { num },
      select: { authorId: true },
    });

    if (!problemSet) {
      return NextResponse.json(
        { message: "Problem set not found" },
        { status: 404 },
      );
    }

    const isSuperAdmin = role === "SUPERADMIN";
    const isAdmin = role === "ADMIN";
    const isAuthor = problemSet.authorId === userId;

    if (!isSuperAdmin && !(isAdmin && isAuthor)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await db.$transaction(async (tx) => {
      // Find all problems in this set
      const problemSetProblems = await tx.problemSetProblem.findMany({
        where: { problemSetNum: num },
        select: { problemNum: true },
      });
      const problemNums = problemSetProblems.map((psp) => psp.problemNum);

      // Find all progress entries for this set to clean up their submissions
      const progressEntries = await tx.problemSetProgress.findMany({
        where: { problemSetNum: num },
        select: { id: true },
      });
      const progressIds = progressEntries.map((p) => p.id);

      // 1. Delete Problem-related records for all problems that were in this set
      if (problemNums.length > 0) {
        await tx.problemStats.deleteMany({
          where: { problemNum: { in: problemNums } },
        });
        await tx.problemEndorsement.deleteMany({
          where: { problemNum: { in: problemNums } },
        });
        await tx.problemLike.deleteMany({
          where: { problemNum: { in: problemNums } },
        });
        await tx.problemStar.deleteMany({
          where: { problemNum: { in: problemNums } },
        });
        await tx.teamProblem.deleteMany({
          where: { problemNum: { in: problemNums } },
        });

        // Delete all join records pointing to these problems (from ANY problem set)
        await tx.problemSetProblem.deleteMany({
          where: { problemNum: { in: problemNums } },
        });

        // Delete the Problems themselves
        await tx.problem.deleteMany({
          where: { num: { in: problemNums } },
        });
      }

      // 2. Delete Submissions related to these problems OR this problem set's progress
      await tx.submission.deleteMany({
        where: {
          OR: [
            { problemNum: { in: problemNums } },
            { problemSetProgressId: { in: progressIds } },
          ],
        },
      });

      // 3. Delete ProblemSet-related records
      await tx.problemSetStats.deleteMany({ where: { problemSetNum: num } });
      await tx.problemSetLike.deleteMany({ where: { problemSetNum: num } });
      await tx.problemSetStar.deleteMany({ where: { problemSetNum: num } });
      await tx.problemSetProgress.deleteMany({ where: { problemSetNum: num } });
      await tx.problemSetLeaderboardEntry.deleteMany({
        where: { problemSetNum: num },
      });
      await tx.teamProblemSet.deleteMany({ where: { problemSetNum: num } });

      // Finally, delete the ProblemSet itself
      await tx.problemSet.delete({ where: { num } });
    });

    return NextResponse.json(
      { message: "Problem set successfully deleted" },
      { status: 200 },
    );
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred while deleting the problem set" },
      { status: 500 },
    );
  }
}
