import { ProblemSetResponse } from "@/lib/rtk/slices/problemSets";
import { Prisma, ProgressStatus } from "@prisma/client";

export const getProblemSetSelect = (
  userId?: string,
): Prisma.ProblemSetSelect => ({
  num: true,
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
          status: ProgressStatus.inprogress,
        },
        select: {
          id: true,
          problemOrder: true,
        },
        take: 1,
      }
    : false,
  problemSetStats: { select: { views: true } },
  description: true,
  problemCount: true,
  averageRank: true,
  createdAt: true,
});

export const mapProblemSetResponse = (
  pset: any,
  userId?: string,
): ProblemSetResponse => {
  const userProgress = pset.problemSetProgresses?.length
    ? pset.problemSetProgresses[0]
    : undefined;
  const userLiked = userId
    ? pset.problemSetLikes.findIndex(
        (p: { userId: string }) => p.userId === userId,
      ) !== -1
    : false;

  return {
    num: pset.num,
    name: pset.name,
    author: pset.author,
    description: pset.description,
    problems: pset.problemSetProblems.map((psp: any) => psp.problem.initial),
    views: pset.problemSetStats?.views,
    likes: pset.problemSetLikes?.length,
    userLiked,
    problemCount: pset.problemCount,
    averageRank: pset.averageRank,
    createdAt: pset.createdAt,
    userProgress,
  };
};
