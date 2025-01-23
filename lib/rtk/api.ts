import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const BASE_URL: string = "/api";

export const POSTS_TAG = "Posts";
export const COMMENTS_TAG = "Comments";
export const LIKES_TAG = "Likes";
export const AUTH_TAG = "Auth";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery: baseQuery,
  endpoints: () => ({}), // Endpoints are injected in features
  tagTypes: [
    POSTS_TAG,
    COMMENTS_TAG,
    LIKES_TAG,
    AUTH_TAG,
  ],
});
