import { Evaluation, GoProblemResponse } from "@/lib/go/interface";
import {
  apiSlice,
  PROBLEM_SET_PROGRESS_TAG,
  PROBLEM_TAG,
  PROBLEMS_TAG,
} from "../api";

interface SubmissionRequest {
  id: string;
  userMoves: string[];
  problemSetProgressId?: string;
}

interface SubmissionResponse {
  evaluation: Evaluation;
  problemSetCompleted?: boolean;
}

export interface ProblemCreateRequest {
  rank: number;
  description?: string;
  initial: string;
  correct: string;
}

export interface ProblemCreateResponse {
  id: string;
}

export interface GetProblemsResponse {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalProblems: number;
  problems: GoProblemResponse[];
}

export interface ProblemCreator {
  name: string;
}

const problemsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProblems: builder.query<
      GetProblemsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 50 }) =>
        `problems?page=${page}&limit=${limit}`,
      providesTags: [PROBLEMS_TAG],
    }),

    getProblem: builder.query<
      GoProblemResponse,
      { id: string; isEdit?: boolean }
    >({
      query: ({ id, isEdit }) =>
        `problems/${id}${isEdit ? "?isEdit=true" : ""}`,
      providesTags: (result, error, arg) => [{ type: PROBLEM_TAG, id: arg.id }],
    }),

    submit: builder.mutation<SubmissionResponse, SubmissionRequest>({
      query: ({ id, ...body }) => ({
        url: `problems/${id}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: [PROBLEM_SET_PROGRESS_TAG],
    }),

    createProblem: builder.mutation<
      ProblemCreateResponse,
      ProblemCreateRequest
    >({
      query: (body) => ({
        url: "problems",
        method: "POST",
        body,
      }),
      invalidatesTags: [PROBLEMS_TAG],
    }),

    updateProblem: builder.mutation<
      ProblemCreateResponse,
      ProblemCreateRequest & { id: string }
    >({
      query: ({ id, ...body }) => ({
        url: `problems/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: PROBLEM_TAG, id: arg.id },
      ],
    }),

    problemLike: builder.mutation<{ liked: boolean }, string>({
      query: (id) => ({
        url: `problems/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [{ type: PROBLEM_TAG, id: arg }],
    }),

    getProblemCreators: builder.query<ProblemCreator[], void>({
      query: () => `problems/creators`,
    }),
  }),
});

export const {
  useGetProblemQuery,
  useSubmitMutation,
  useGetProblemsQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useProblemLikeMutation,
  useGetProblemCreatorsQuery,
} = problemsApiSlice;
