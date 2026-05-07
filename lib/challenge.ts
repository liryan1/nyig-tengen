import { db } from "@/lib/db";
import { ChallengeAnswer, ChallengeProblem } from "@prisma/client";
import { ChallengeLeaderboardPeriod } from "@prisma/client";

export const PROBLEMS_BATCH_SIZE = 100;
export const START_TIME_MS = 30_000;
export const CORRECT_BONUS_MS = 3_000;

// Difficulty zones for the randomizer
// Zone configurations: 5 zones of 20 problems each with progressive difficulty
const DIFFICULTY_ZONES = [
  // Zone 1 (1-20): Easy start
  { size: 20, distribution: { 1: 0.6, 2: 0.3, 3: 0.1, 4: 0, 5: 0 } },
  // Zone 2 (21-40): Gradual increase
  { size: 20, distribution: { 1: 0.4, 2: 0.3, 3: 0.2, 4: 0.1, 5: 0 } },
  // Zone 3 (41-60): Middle difficulty
  { size: 20, distribution: { 1: 0.1, 2: 0.3, 3: 0.4, 4: 0.2, 5: 0 } },
  // Zone 4 (61-80): Getting harder
  { size: 20, distribution: { 1: 0, 2: 0.1, 3: 0.4, 4: 0.4, 5: 0.1 } },
  // Zone 5 (81-100): Challenging endgame
  { size: 20, distribution: { 1: 0, 2: 0, 3: 0.5, 4: 0.3, 5: 0.2 } },
];

export const CHALLEGE_ANSWER_LABEL = {
  [ChallengeAnswer.DEAD]: "Dead",
  [ChallengeAnswer.UNSETTLED]: "Unsettled",
  [ChallengeAnswer.ALIVE]: "Alive",
};

export interface ChallengeAttemptProblem extends Pick<
  ChallengeProblem,
  "num" | "sgf" | "correctAnswer"
> {}

export async function getRandomProblems(
  count: number = PROBLEMS_BATCH_SIZE,
  attemptedProblemNums: string[] = [],
) {
  const allProblems: ChallengeAttemptProblem[] = [];

  for (const zone of DIFFICULTY_ZONES) {
    const zoneProblems: ChallengeAttemptProblem[] = [];

    // Sample problems for each difficulty level in this zone
    for (const [difficultyStr, percentage] of Object.entries(
      zone.distribution,
    )) {
      const difficulty = parseInt(difficultyStr);
      const neededCount = Math.round(zone.size * percentage);

      if (neededCount === 0) continue;

      // Build match criteria
      const matchStage: any = { difficulty };
      if (attemptedProblemNums.length > 0) {
        matchStage.num = { $nin: attemptedProblemNums };
      }

      const response: unknown = await db.challengeProblem.aggregateRaw({
        pipeline: [
          { $match: matchStage },
          { $sample: { size: neededCount } },
          {
            $project: {
              _id: 0,
              num: 1,
              sgf: 1,
              correctAnswer: 1,
              difficulty: 1,
            },
          },
        ],
      });

      if (response && (response as any[]).length > 0) {
        zoneProblems.push(...(response as ChallengeAttemptProblem[]));
      }
    }

    // Shuffle problems within the zone to add randomness
    shuffleArray(zoneProblems);
    allProblems.push(...zoneProblems);
  }

  if (allProblems.length === 0) {
    throw new Error("No challenge problems available");
  }

  // Return exactly count problems (or all if less available)
  return allProblems.slice(0, count);
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
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
