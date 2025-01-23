import { Comment } from "@prisma/client";
import { apiSlice } from "../api";

export const commentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<Comment[], { postId?: string }>({
      query: (args) => {
        const params = new URLSearchParams(args).toString();
        return `comments?${params}`;
      },
    }),
    getCommentById: builder.query<Comment, string>({
      query: (commentId) => `comments/${commentId}`,
    }),
    createComment: builder.mutation<Comment, { postId: string; content: string }>({
      query: (body) => ({
        url: "comments",
        method: "POST",
        body,
      }),
    }),
    updateComment: builder.mutation<Comment, { commentId: string; content: string }>({
      query: ({ commentId, content }) => ({
        url: `comments/${commentId}`,
        method: "PATCH",
        body: { content },
      }),
    }),
    deleteComment: builder.mutation<Comment, string>({
      query: (commentId) => ({
        url: `comments/${commentId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useGetCommentByIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentsApi;
