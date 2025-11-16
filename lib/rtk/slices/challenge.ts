import { ChallengeAttemptProblem } from "@/lib/challenge";
import { apiSlice } from "../api";
import { ChallengeLeaderboardPeriod } from "@prisma/client";

export interface PersonalBest {
  problemsCorrect: number;
  timeSpentMs: number;
}

export interface StartChallengeResponse {
  attemptId: string;
  problems: ChallengeAttemptProblem[];
  personalBest: PersonalBest;
}

interface ChallengeSubmitRequest {
  attemptId: string;
  score: number;
  timeSpentMs: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
  };
  problemsCorrect: number;
  timeSpentMs: number;
  completionCount: number;
  completedAt: string;
}

export interface ChallengeLeaderboardResponse {
  period: string;
  topEntries: LeaderboardEntry[];
  userEntry: LeaderboardEntry | null;
}

export const challengeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    startChallenge: builder.query<StartChallengeResponse, void>({
      query: () => `challenge/start`,
    }),
    challengeLeaderboard: builder.query<
      ChallengeLeaderboardResponse,
      ChallengeLeaderboardPeriod | undefined
    >({
      query: (p) => `challenge/hs${p ? `?p=${p}` : ""}`,
    }),
    challengeSubmit: builder.mutation<PersonalBest, ChallengeSubmitRequest>({
      query: ({ attemptId, score, timeSpentMs }) => ({
        url: `challenge/${attemptId}`,
        method: "POST",
        body: { score, timeSpentMs },
      }),
    }),
  }),
});

export const {
  useStartChallengeQuery,
  useChallengeLeaderboardQuery,
  useChallengeSubmitMutation,
} = challengeApi;
