import { GoProblemResponse } from "@/lib/go/interface";
import { Prisma } from "@prisma/client";

export const getProblemSelect = (userId?: string): Prisma.ProblemSelect => ({
  id: true,
  num: true,
  description: true,
  initial: true,
  author: {
    select: {
      id: true,
      name: true,
    },
  },
  rank: true,
  problemStats: {
    select: {
      id: true,
      views: true,
      submissionCount: true,
      correctCount: true,
    },
  },
  problemLikes: {
    select: {
      userId: true,
    },
  },
  visibility: true,
  // If the user is logged in, fetch the first solved submission
  submissions: userId
    ? {
        where: {
          userId,
          status: "solved",
        },
        select: {
          status: true,
        },
        take: 1,
      }
    : false,
});

export const mapProblemResponse = (
  problem: any,
  userId?: string,
): GoProblemResponse => ({
  num: problem.num,
  initial: problem.initial,
  rank: problem.rank,
  description: problem.description,
  author: problem.author,
  userSolved: problem.submissions?.at(0)?.status === "solved",
  stats: {
    views: problem.problemStats?.views,
    submissionCount: problem.problemStats?.submissionCount,
    correctCount: problem.problemStats?.correctCount,
    userLiked:
      problem.problemLikes.findIndex(
        (p: { userId: string }) => p.userId === userId,
      ) !== -1,
    likes: problem.problemLikes?.length,
  },
  visibility: problem.visibility,
});
