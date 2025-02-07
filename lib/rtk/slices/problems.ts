import {
  Evaluation,
  GoProblemResponse,
  ProblemStats,
} from "@/lib/go/interface";
import { apiSlice, PROBLEM_SET_PROGRESS_TAG, PROBLEMS_TAG } from "../api";

interface SubmissionRequest {
  id: string;
  userMoves: string[];
  problemSetProgressId?: string;
}

interface SubmissionResponse {
  evaluation: Evaluation;
  submissionId: string;
}

export interface GetProblemsResponse {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalProblems: number;
  problems: GoProblemResponse[];
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
    getProblem: builder.query<GoProblemResponse, string>({
      query: (id) => `problems/${id}`,
      providesTags: [PROBLEMS_TAG],
    }),
    submit: builder.mutation<SubmissionResponse, SubmissionRequest>({
      query: ({ id, ...body }) => ({
        url: `problems/${id}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: [PROBLEM_SET_PROGRESS_TAG],
    }),
  }),
});

export const { useGetProblemQuery, useSubmitMutation, useGetProblemsQuery } =
  problemsApiSlice;
