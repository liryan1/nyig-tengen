import { Prisma } from "@prisma/client";

export const getProblemSetSelect = (
  userId?: string,
): Prisma.ProblemSetSelect => ({
  id: true,
  name: true,
  author: {
    select: {
      id: true,
      name: true,
    },
  },
  problemSetProblems: {
    include: { problem: { select: { initial: true } } },
    take: 10,
  },
  problemSetLikes: {
    select: {
      userId: true,
    },
  },
  problemSetProgresses: userId
    ? {
        where: {
          userId,
          status: "completed",
        },
        select: {
          updatedAt: true,
        },
      }
    : false,
  problemSetStats: { select: { views: true } },
  description: true,
  problemCount: true,
  averageRank: true,
  createdAt: true,
});

export const mapProblemSetResponse = (problemSets: any[], userId?: string) =>
  problemSets.map((pset) => ({
    ...pset,
    problemSetProblems: undefined,
    views: pset.problemSetStats?.views,
    likes: pset.problemSetLikes.length,
    userLiked: userId
      ? pset.problemSetLikes.findIndex(
          (p: { userId: string }) => p.userId === userId,
        ) !== -1
      : false,
    userCompletions: pset.problemSetProgresses?.length,
    // prisma type is incorrect with include statements
    problems: pset.problemSetProblems.map((psp: any) => psp.problem.initial),
  }));
