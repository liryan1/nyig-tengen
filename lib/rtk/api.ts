import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const BASE_URL: string = "/api";

export const AUTH_TAG = "Auth" as const;
export const TEAMS_TAG = "Teams" as const;
export const TEAM_INVITES_TAG = "TeamInvites" as const;
export const PROBLEMS_TAG = "Problems" as const;
export const PROBLEM_TAG = "Problem" as const;
export const PROBLEM_SETS_TAG = "ProblemSets" as const;
export const PROBLEM_SET_TAG = "ProblemSet" as const;

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery: baseQuery,
  endpoints: () => ({}), // Endpoints are injected in features
  tagTypes: [
    PROBLEM_SETS_TAG,
    PROBLEM_SET_TAG,
    PROBLEMS_TAG,
    PROBLEM_TAG,
    AUTH_TAG,
    TEAMS_TAG,
    TEAM_INVITES_TAG,
  ],
});
