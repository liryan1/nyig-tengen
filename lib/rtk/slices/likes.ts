// store/services/likes.ts
import { Like } from "@prisma/client";
import { apiSlice } from "../api";

interface ToggleLikeRequest {
  postId?: string;
  commentId?: string;
}

interface ToggleLikeResponse {
  liked: boolean;
  like: Like | null;
}

const likesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLikes: builder.query<Like, { postId?: string; commentId?: string; userId?: string }>({
      query: (args) => ({
        url: "likes",
        params: args,
      }),
    }),
    createLike: builder.mutation<Like, { postId?: string; commentId?: string }>({
      query: (body) => ({
        url: "likes",
        method: "POST",
        body,
      }),
    }),
    deleteLikeById: builder.mutation<Like, string>({
      // If we know the likeId
      query: (likeId) => ({
        url: `likes?likeId=${likeId}`,
        method: "DELETE",
      }),
    }),
    deleteLikeByResource: builder.mutation<Like, { postId?: string; commentId?: string }>({
      // If we only know postId/commentId
      query: (args) => {
        const queryParams = new URLSearchParams(args).toString();
        return {
          url: `likes?${queryParams}`,
          method: "DELETE",
        };
      },
    }),
    toggleLike: builder.mutation<ToggleLikeResponse, ToggleLikeRequest>({
      query: (body) => ({
        url: "likes/toggle",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetLikesQuery,
  useCreateLikeMutation,
  useDeleteLikeByIdMutation,
  useDeleteLikeByResourceMutation,
  useToggleLikeMutation,
} = likesApiSlice;
