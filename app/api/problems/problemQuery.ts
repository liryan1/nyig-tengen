import { GoProblemResponse } from "@/lib/go/interface";
import { Prisma, SubmissionStatus, Visibility } from "@prisma/client";

export const getProblemSelect = (userId?: string): Prisma.ProblemSelect => ({
  id: true,
  num: true,
  description: true,
  initial: true,
  author: {
    select: {
      id: true,
      name: true,
      role: true,
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
  problemStars: {
    select: {
      userId: true,
    },
  },
  visibility: true,
  endorsement: {
    select: {
      user: {
        select: { id: true, name: true, info: { select: { rank: true } } },
      },
    },
  },
  // If the user is logged in, fetch the first solved submission
  submissions: userId
    ? {
        where: {
          userId,
          status: SubmissionStatus.solved,
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
  endorser: problem.endorsement?.user
    ? {
        id: problem.endorsement.user.id,
        name: problem.endorsement.user.name,
        rank: problem.endorsement.user.info?.rank,
      }
    : undefined,
  userSolved: problem.submissions?.at(0)?.status === "solved",
  stats: {
    views: problem.problemStats?.views,
    submissionCount: problem.problemStats?.submissionCount,
    correctCount: problem.problemStats?.correctCount,
    userLiked:
      problem.problemLikes.findIndex(
        (p: { userId: string }) => p.userId === userId,
      ) !== -1,
    userStarred:
      problem.problemStars.findIndex(
        (p: { userId: string }) => p.userId === userId,
      ) !== -1,
    likes: problem.problemLikes?.length,
  },
  visibility: problem.visibility,
});
