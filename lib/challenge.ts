import { db } from "@/lib/db";
import { ChallengeAnswer, ChallengeProblem } from "@prisma/client";
import { ChallengeLeaderboardPeriod } from "@prisma/client";

export const PROBLEMS_BATCH_SIZE = 10;
export const START_TIME_MS = 30_000;
export const CORRECT_BONUS_MS = 3_000;

export const CHALLEGE_ANSWER_LABEL = {
  [ChallengeAnswer.DEAD]: "Dead",
  [ChallengeAnswer.UNSETTLED]: "Unsettled",
  [ChallengeAnswer.ALIVE]: "Alive",
};

export interface ChallengeAttemptProblem
  extends Pick<ChallengeProblem, "num" | "sgf" | "correctAnswer"> {}

export async function getRandomProblems(
  count: number = 5,
  attemptedProblemNums: string[] = [],
) {
  const response: unknown = await db.challengeProblem.aggregateRaw({
    pipeline: [
      { $sample: { size: count } },
      { $project: { _id: 0, num: 1, sgf: 1, correctAnswer: 1 } },
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

  return response as ChallengeAttemptProblem[];
}

export function getPeriodStart(
  period: ChallengeLeaderboardPeriod,
  date: Date = new Date(),
): Date {
  // Convert to EST (UTC-5, or UTC-4 during DST)
  const estDate = new Date(
    date.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );

  switch (period) {
    case ChallengeLeaderboardPeriod.DAY:
      // Start of day in EST
      estDate.setHours(0, 0, 0, 0);
      return new Date(
        estDate.toLocaleString("en-US", { timeZone: "America/New_York" }),
      );

    case ChallengeLeaderboardPeriod.WEEK:
      // Start of Monday of current week in EST
      const day = estDate.getDay();
      const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days, otherwise go to Monday
      estDate.setDate(estDate.getDate() + diff);
      estDate.setHours(0, 0, 0, 0);
      return new Date(
        estDate.toLocaleString("en-US", { timeZone: "America/New_York" }),
      );

    case ChallengeLeaderboardPeriod.MONTH:
      // Start of month in EST
      estDate.setDate(1);
      estDate.setHours(0, 0, 0, 0);
      return new Date(
        estDate.toLocaleString("en-US", { timeZone: "America/New_York" }),
      );

    case ChallengeLeaderboardPeriod.YEAR:
      // Start of year in EST
      estDate.setMonth(0, 1);
      estDate.setHours(0, 0, 0, 0);
      return new Date(
        estDate.toLocaleString("en-US", { timeZone: "America/New_York" }),
      );

    case ChallengeLeaderboardPeriod.ALLTIME:
      // Fixed start date for all-time records
      return new Date("2000-01-01T00:00:00Z");

    default:
      throw new Error(`Unknown period: ${period}`);
  }
}

/**
 * Determine if a new score is better than an existing score
 * Better = more problems correct, or same correct with less time
 */
export function isBetterScore(
  newCorrect: number,
  newTimeMs: number,
  existingCorrect: number,
  existingTimeMs: number,
): boolean {
  if (newCorrect > existingCorrect) {
    return true;
  }
  if (newCorrect === existingCorrect && newTimeMs < existingTimeMs) {
    return true;
  }
  return false;
}
