import { Evaluation, GoProblemResponse } from "@/lib/go/interface";
import { apiSlice, PROBLEM_SET_TAG, PROBLEM_TAG, PROBLEMS_TAG } from "../api";
import { Visibility } from "@prisma/client";

interface SubmissionRequest {
  num: string;
  userMoves: string[];
  problemSetProgressId?: string;
}

interface SubmissionResponse {
  evaluation: Evaluation;
  /**
   * if problemSetProgressId is passed, response returns problemSetId
   */
  problemSetNum?: string;
  /**
   * Used for knowing if user completed the last problem in this submission
   * Triggers confetti
   */
  problemSetCompleted?: boolean;
}

export interface ProblemCreateRequest {
  rank: number;
  description?: string;
  initial: string;
  correct: string;
  visibility?: Visibility;
  teamSlugs?: string[];
}

export interface ProblemCreateResponse {
  num: string;
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
    getProblems: builder.query<GetProblemsResponse, string>({
      query: (search) => `problems?${search}`,
      providesTags: [PROBLEMS_TAG],
    }),

    getProblem: builder.query<
      GoProblemResponse,
      { num: string; isEdit?: boolean }
    >({
      query: ({ num, isEdit }) =>
        `problems/${num}${isEdit ? "?isEdit=true" : ""}`,
      providesTags: (result, error, arg) => [
        { type: PROBLEM_TAG, id: arg.num },
      ],
    }),

    submit: builder.mutation<SubmissionResponse, SubmissionRequest>({
      query: ({ num, ...body }) => ({
        url: `problems/${num}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: PROBLEM_SET_TAG, id: result?.problemSetNum },
        { type: PROBLEM_TAG, id: arg.num },
      ],
    }),

    endorse: builder.mutation<{ endorsed: boolean }, string>({
      query: (num) => ({
        url: `problems/${num}/endorse`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [{ type: PROBLEM_TAG, id: arg }],
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
      ProblemCreateRequest & { num: string }
    >({
      query: ({ num, ...body }) => ({
        url: `problems/${num}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: PROBLEM_TAG, id: arg.num },
      ],
    }),

    problemLike: builder.mutation<{ liked: boolean }, string>({
      query: (num) => ({
        url: `problems/${num}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [{ type: PROBLEM_TAG, id: arg }],
    }),

    problemStar: builder.mutation<{ starred: boolean }, string>({
      query: (num) => ({
        url: `/problems/${num}/star`,
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
  useEndorseMutation,
  useGetProblemsQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useProblemLikeMutation,
  useProblemStarMutation,
  useGetProblemCreatorsQuery,
} = problemsApiSlice;
