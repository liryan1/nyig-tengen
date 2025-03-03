import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const BASE_URL: string = "/api";

export const POSTS_TAG = "Posts";
export const POST_TAG = "Post"; // single post
export const COMMENTS_TAG = "Comments";
export const LIKES_TAG = "Likes";
export const AUTH_TAG = "Auth";
export const TEAMS_TAG = "Teams";
export const PROBLEMS_TAG = "Problems";
export const PROBLEM_TAG = "Problem";
export const PROBLEM_SETS_TAG = "ProblemSets";
export const PROBLEM_SET_TAG = "ProblemSet";

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
    POST_TAG,
    POSTS_TAG,
    COMMENTS_TAG,
    LIKES_TAG,
    AUTH_TAG,
    TEAMS_TAG,
  ],
});
