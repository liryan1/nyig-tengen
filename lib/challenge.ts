import { db } from "@/lib/db";
import { ChallengeAnswer, ChallengeProblem } from "@prisma/client";

export const PROBLEMS_BATCH_SIZE = 5;
export const START_TIME_MS = 30_000;
export const MAX_LAG_MS = 15_000; // maximum tolerable cumulative lag for each batch of problems
export const CORRECT_BONUS_MS = 3_000;

export const CHALLEGE_ANSWER_LABEL = {
  [ChallengeAnswer.DEAD]: "Dead",
  [ChallengeAnswer.UNFINISHED]: "Unfinished",
  [ChallengeAnswer.ALIVE]: "Alive",
};

export interface ChallengeSessionProblem
  extends Pick<ChallengeProblem, "num" | "sgf" | "correctAnswer"> {}

export interface ClientAnswer {
  num: string;
  answer: ChallengeAnswer;
  timeSpentMs: number; // time user spent on this problem (front-end measured)
}

export async function getRandomProblems(
  count: number = 5,
  attemptedProblemNums: string[] = [],
) {
  const response: unknown = await db.challengeProblem.aggregateRaw({
    pipeline: [
      { $sample: { size: count } },
      { $project: { num: 1 } },
      ...(attemptedProblemNums.length > 0
        ? [
            {
              $match: {
                num: { $nin: attemptedProblemNums },
              },
            },
          ]
        : []),
    ],
  });

  if (!response || (response as any[]).length === 0) {
    throw new Error("No challenge problems available");
  }

  return (response as any[]).map((problem) => problem.num) as string[];
}

/**
 * Validates answers type and validity
 * Cannot have
 */
export function validateClientAnswers(answers: any[]): ClientAnswer[] {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new Error("validateClientAnswers: Invalid or empty answers array");
  }

  const validatedAnswers = answers.map((answer: any) => {
    if (!answer.num || !answer.answer || !answer.timeSpentMs) {
      throw new Error("Invalid answer format");
    }

    return {
      num: answer.num,
      answer: answer.answer,
      timeSpentMs: answer.timeSpentMs,
    };
  });

  return validatedAnswers;
}
