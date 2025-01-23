import { Post } from "@prisma/client";
import { apiSlice, POSTS_TAG } from "../api";

interface Posts {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  data: PostResponse[];
}

export interface PostResponse extends Post {
  author: {id: string, name: string}
  likes: {id: string, postId?: string, userId?: string}[]
}

interface PostQuery {
  page?: number;
  limit?: number;
  author?: string;
  name?: string;
}

const postsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<Posts, PostQuery>({
      query: ({ page = 1, limit = 10, author, name }) => {
        return {
          url: "posts",
          params: { page, limit, author, name },
        };
      },
      providesTags: [POSTS_TAG],
    }),

    createPost: builder.mutation<void, { title: string; content: string, wordCount?: number }>({
      query: (body) => ({
        url: "posts",
        method: "POST",
        body,
      }),
      invalidatesTags: [POSTS_TAG],
    }),

    getPostBySlug: builder.query<Post, string>({
      query: (postId) => `posts/${postId}`,
      providesTags: [POSTS_TAG],
    }),

    updatePost: builder.mutation<
      void,
      { slug: string; title?: string; content?: string, wordCount?: number }
    >({
      query: ({ slug, ...rest }) => ({
        url: `posts/${slug}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: [POSTS_TAG],
    }),

    deletePost: builder.mutation<void, string>({
      query: (postId) => ({
        url: `posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: [POSTS_TAG],
    }),

    incrementViews: builder.mutation<void, string>({
      query: (postId) => ({
        url: `posts/${postId}/views`,
        method: "PATCH",
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useGetPostBySlugQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
  useIncrementViewsMutation,
} = postsApiSlice;
