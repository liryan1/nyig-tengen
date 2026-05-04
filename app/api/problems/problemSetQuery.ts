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
      role: true,
    },
  },
  problemSetProblems: {
    include: { problem: { select: { initial: true } } },
    take: 10,
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
  problemSetStats: {
    select: { views: true, completed: true, likes: true, stars: true },
  },
  description: true,
  problemCount: true,
  averageRank: true,
  createdAt: true,
});

export const mapProblemSetResponse = (
  pset: any,
  userId?: string,
  userLiked: boolean = false,
  userStarred: boolean = false,
): ProblemSetResponse => {
  const userProgress = pset.problemSetProgresses?.[0];

  return {
    num: pset.num,
    name: pset.name,
    author: pset.author,
    description: pset.description,
    problems: pset.problemSetProblems.map((psp: any) => psp.problem.initial),
    views: pset.problemSetStats?.views,
    likes: pset.problemSetStats?.likes || 0,
    completedCount: pset.problemSetStats?.completed,
    userLiked,
    userStarred,
    problemCount: pset.problemCount,
    averageRank: pset.averageRank,
    createdAt: pset.createdAt,
    userProgress,
  };
};
