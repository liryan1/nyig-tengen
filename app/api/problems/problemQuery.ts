import { getBoardCutoff } from "@/lib/go/display";
import { GoProblemResponse } from "@/lib/go/interface";
import { fromSgf, getBoardSize } from "@/lib/go/parser";
import { Prisma, Visibility } from "@prisma/client";

export const getProblemSelect = (userId?: string): Prisma.ProblemSelect => ({
  id: true,
  num: true,
  description: true,
  initial: true,
  correct: true,
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
      likes: true,
      stars: true,
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
});

export const mapProblemResponse = (
  problem: any,
  userId?: string,
  userLiked: boolean = false,
  userStarred: boolean = false,
  userSolved: boolean = false,
): GoProblemResponse => {
  const boardSize = getBoardSize(problem.initial);
  const cutoff = getBoardCutoff(
    [fromSgf(problem.initial), fromSgf(problem.correct)],
    boardSize,
  );

  return {
    num: problem.num,
    initial: problem.initial,
    cutoff,
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
    userSolved,
    stats: {
      views: problem.problemStats?.views,
      submissionCount: problem.problemStats?.submissionCount,
      correctCount: problem.problemStats?.correctCount,
      userLiked,
      userStarred,
      likes: problem.problemStats?.likes || 0,
    },
    visibility: problem.visibility,
  };
};

/**
 * Represents permissions on the problem:
 * 1. The problem is public
 * 2. The problem is owned by the user
 * 3. The problem is team-based and the user is a member of the team
 */
export const getProblemSelectOR = (
  userId?: string,
): Prisma.ProblemWhereInput[] => [
  { visibility: Visibility.PUBLIC },
  {
    authorId: userId,
  },
  {
    teamProblems: {
      some: {
        team: {
          memberships: {
            some: {
              userId: userId,
            },
          },
        },
      },
    },
  },
];
