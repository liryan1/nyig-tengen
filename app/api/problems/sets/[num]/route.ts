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
        problemSetProblems: {
          select: { problem: true, position: true },
        },
        problemSetStats: { select: { views: true, completed: true } },
        problemSetLikes: {
          select: {
            userId: true,
          },
        },
        problemSetStars: {
          select: {
            userId: true,
          },
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
              select: {
                id: true,
                problemOrder: true,
                status: true,
              },
            }
          : false,
      },
    });

    if (!problemSet) {
      return NextResponse.json("Problem set not found", { status: 404 });
    }

    const problems = problemSet.problemSetProblems.map((psp) => ({
      num: psp.problem.num,
      rank: psp.problem.rank,
      initial: psp.problem.initial,
      position: psp.position,
    }));

    const userLiked = problemSet.problemSetLikes.some(
      (like) => like.userId === userId,
    );

    const userStarred = problemSet.problemSetStars.some(
      (like) => like.userId === userId,
    );

    const userProgress = problemSet.problemSetProgresses?.find(
      (psp) => psp.status === "inprogress",
    );
    const userCompletions = problemSet.problemSetProgresses?.filter(
      (psp) => psp.status === "completed",
    )?.length;

    const order = userProgress?.problemOrder as ProblemOrderItem[] | undefined;
    if (order) {
      // If order exists, then sort the problems array based on order.num
      problems.sort((a, b) => {
        const aIndex = order.findIndex((item) => item.problemNum === a.num);
        const bIndex = order.findIndex((item) => item.problemNum === b.num);
        return aIndex - bIndex;
      });
    } else {
      // If order does not exist, then sort the problems array based on default position
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
