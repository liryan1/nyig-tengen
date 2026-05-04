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
  _count: {
    select: {
      problemSetLikes: true,
    },
  },
  problemSetLikes: userId
    ? {
        where: {
          userId,
        },
        select: {
          userId: true,
        },
        take: 1,
      }
    : false,
  problemSetStars: userId
    ? {
        where: {
          userId,
        },
        select: {
          userId: true,
        },
        take: 1,
      }
    : false,
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
  problemSetStats: { select: { views: true, completed: true } },
  description: true,
  problemCount: true,
  averageRank: true,
  createdAt: true,
});

export const mapProblemSetResponse = (
  pset: any,
  userId?: string,
): ProblemSetResponse => {
  const userProgress = pset.problemSetProgresses?.[0];
  const userLiked = userId ? pset.problemSetLikes?.length > 0 : false;
  const userStarred = userId ? pset.problemSetStars?.length > 0 : false;

  return {
    num: pset.num,
    name: pset.name,
    author: pset.author,
    description: pset.description,
    problems: pset.problemSetProblems.map((psp: any) => psp.problem.initial),
    views: pset.problemSetStats?.views,
    likes: pset._count?.problemSetLikes || 0,
    completedCount: pset.problemSetStats?.completed,
    userLiked,
    userStarred,
    problemCount: pset.problemCount,
    averageRank: pset.averageRank,
    createdAt: pset.createdAt,
    userProgress,
  };
};
