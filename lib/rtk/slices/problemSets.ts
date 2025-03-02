import {
  ProblemSetProgress,
  ProgressStatus,
  SubmissionStatus,
} from "@prisma/client";
import { apiSlice, PROBLEM_SET_PROGRESS_TAG, PROBLEM_SETS_TAG } from "../api";

export interface ProblemSetResponse {
  id: string;
  name: string;
  author: { id: string; name: string };
  description?: string;
  problems: string[];
  views?: number;
  likes: number;
  userLiked: boolean;
  userCompletions: number;
  problemCount: number;
  averageRank: number;
  createdAt: string;
}

export interface GetPSetsResponse {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalProblems: number;
  problemSets: ProblemSetResponse[];
}

interface PSetProblem {
  id: string;
  rank: number;
  position: number;
  initial: string;
}

export interface PSetResponse extends Omit<ProblemSetResponse, "problems"> {
  completedCount: number;
  attemptedCount: number;
  views: number;
  likes: number;
  userLiked: boolean;
  userCompletions: number;
  problems: PSetProblem[];
}

export interface PSetProblemResponse {
  problem: PSetProblem;
  progress: ProblemSetProgress;
}

export interface GetPSetProgressResponse {
  progress?: PSetProgressResponse;
  completedCount: number;
}

export interface ProblemOrder {
  problemId: string;
  status?: SubmissionStatus;
}

export interface CreatePSetProgressResponse {
  id: string;
  createdAt: string;
  status: ProgressStatus;
  problemOrder: ProblemOrder[];
  problemSet: {
    name: string;
    id: string;
  };
}

export interface PSetProgressResponse {
  id: string;
  createdAt: string;
  problemSet: { name: string; id: string };
  problemOrder: ProblemOrder[];
  status: ProgressStatus;
}

const problemsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPSets: builder.query<
      GetPSetsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) =>
        `/problems/sets?page=${page}&limit=${limit}`,
      providesTags: [PROBLEM_SETS_TAG],
    }),
    getPSet: builder.query<PSetResponse, string>({
      query: (id) => `/problems/sets/${id}`,
      providesTags: [PROBLEM_SETS_TAG],
    }),
    getPSetProgress: builder.query<GetPSetProgressResponse, string>({
      query: (id) => `/problems/sets/${id}/progress`,
      providesTags: [PROBLEM_SET_PROGRESS_TAG],
    }),
    createPSetProgress: builder.mutation<
      CreatePSetProgressResponse,
      { id: string; randomize?: boolean }
    >({
      query: ({ id, randomize }) => ({
        url: `/problems/sets/${id}/progress`,
        method: "POST",
        body: { randomize },
      }),
      invalidatesTags: [PROBLEM_SET_PROGRESS_TAG],
    }),
    PSetLike: builder.mutation<{ liked: boolean }, string>({
      query: (id) => ({
        url: `problems/sets/${id}/like`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetPSetsQuery,
  useGetPSetQuery,
  useGetPSetProgressQuery,
  useCreatePSetProgressMutation,
  usePSetLikeMutation,
} = problemsApiSlice;
