// store/services/likes.ts
import { apiSlice } from "../api";

interface ToggleLikeRequest {
  postId?: string;
  commentId?: string;
}

interface ToggleLikeResponse {
  liked: boolean;
}

const likesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    toggleLike: builder.mutation<ToggleLikeResponse, ToggleLikeRequest>({
      query: (body) => ({
        url: "likes/toggle",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useToggleLikeMutation } = likesApiSlice;
