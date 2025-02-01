import {
  BoardHistory,
  Evaluation,
  ProblemResponse,
  ProblemStats,
  Variation,
} from "@/lib/go/interface";
import {
  apiSlice,
  PROBLEM_SET_PROGRESS_TAG,
  PROBLEM_SETS_TAG,
  PROBLEMS_TAG,
} from "../api";

interface SubmissionRequest {
  id: string;
  userMoves: Variation;
  problemSetProgressId?: string;
}

interface SubmissionResponse {
  evaluation: Evaluation;
  submissionId: string;
}

export interface GetProblemProblemResponse {
  id: string;
  title?: string;
  description?: string;
  initial: BoardHistory;
  correct: Variation[];
  rank: number;
  author: { id: string; name: string };
  problemStats?: ProblemStats;
}

export interface GetProblemsResponse {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalProblems: number;
  problems: GetProblemProblemResponse[];
}

const problemsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProblems: builder.query<
      GetProblemsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 50 }) =>
        `/problems?page=${page}&limit=${limit}`,
      providesTags: [PROBLEMS_TAG],
    }),
    getProblem: builder.query<ProblemResponse, string>({
      query: (id) => `problems/${id}`,
      providesTags: [PROBLEMS_TAG],
    }),
    submit: builder.mutation<SubmissionResponse, SubmissionRequest>({
      query: ({ id, ...body }) => ({
        url: `problems/${id}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: [PROBLEMS_TAG, PROBLEM_SET_PROGRESS_TAG],
    }),
  }),
});

export const { useGetProblemQuery, useSubmitMutation, useGetProblemsQuery } =
  problemsApiSlice;
