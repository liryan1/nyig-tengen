import { BoardHistory } from "@/lib/go/interface";
import {
  ProblemSetProgress,
  ProgressStatus,
  SubmissionStatus,
} from "@prisma/client";
import { apiSlice, PROBLEM_SET_PROGRESS_TAG, PROBLEM_SETS_TAG } from "../api";

export interface GetPSetsProblemSet {
  id: string;
  name: string;
  author: { id: string; name: string };
  description?: string;
  problems: BoardHistory[];
  views?: number;
  problemCount: number;
  averageRank: number;
  createdAt: string;
}

export interface GetPSetsResponse {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalProblems: number;
  problemSets: GetPSetsProblemSet[];
}

interface GetPSetProblem {
  id: string;
  rank: number;
  position: number;
  initial: BoardHistory;
}

export interface PSetResponse extends Omit<GetPSetsProblemSet, "problems"> {
  completedCount: number;
  attemptedCount: number;
  views: number;
  likes: number;
  problems: GetPSetProblem[];
}

export interface PSetProblemResponse {
  problem: GetPSetProblem;
  progress: ProblemSetProgress;
}

export interface GetPSetProgressResponse {
  progress?: PSetProgressResponse;
  completedCount: number;
}

export interface PSetProgressResponse {
  id: string;
  createdAt: string;
  problemSet: { name: string; id: string };
  problemOrder: { problemId: string; status?: SubmissionStatus }[];
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
      GetPSetProgressResponse,
      { id: string; randomize?: boolean }
    >({
      query: ({ id, randomize }) => ({
        url: `/problems/sets/${id}/progress`,
        method: "POST",
        body: { randomize },
      }),
      invalidatesTags: [PROBLEM_SET_PROGRESS_TAG],
    }),
  }),
});

export const {
  useGetPSetsQuery,
  useGetPSetQuery,
  useGetPSetProgressQuery,
  useCreatePSetProgressMutation,
} = problemsApiSlice;
