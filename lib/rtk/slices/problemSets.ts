import {
  ProblemSetProgress,
  ProgressStatus,
  SubmissionStatus,
  UserRole,
} from "@prisma/client";
import { apiSlice, PROBLEM_SET_TAG, PROBLEM_SETS_TAG } from "../api";

export interface ProblemSetResponse {
  num: string;
  name: string;
  author: { id: string; name: string; role: UserRole };
  description?: string;
  problems: string[];
  views: number;
  likes: number;
  userLiked?: boolean;
  userProgress?: { id: string; problemOrder: ProblemOrderItem[] };
  completedCount?: number;
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

export interface PSetProblem {
  num: string;
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

export interface ProblemOrderItem {
  problemNum: string;
  status?: SubmissionStatus;
}

export interface CreatePSetProgressResponse {
  id: string;
  createdAt: string;
  status: ProgressStatus;
  problemOrder: ProblemOrderItem[];
  problemSet: {
    name: string;
    num: string;
  };
}

export interface PSetProgressResponse {
  id: string;
  problemSet: { name: string; id: string };
  problemOrder: ProblemOrderItem[];
  status: ProgressStatus;
}

const problemsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPSets: builder.query<GetPSetsResponse, string>({
      query: (search) => `/problems/sets?${search}`,
      providesTags: [PROBLEM_SETS_TAG],
    }),
    getPSet: builder.query<PSetResponse, string>({
      query: (num) => `/problems/sets/${num}`,
      providesTags: (result, error, arg) => [
        { type: PROBLEM_SET_TAG, id: arg },
      ],
    }),
    getPSetProgress: builder.query<PSetProgressResponse, string>({
      query: (num) => `/problems/sets/${num}/progress`,
      providesTags: (result, error, arg) => [
        { type: PROBLEM_SET_TAG, id: arg },
      ],
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
      invalidatesTags: (result, error, arg) => [
        { type: PROBLEM_SET_TAG, id: arg.id },
      ],
    }),
    pSetLike: builder.mutation<{ liked: boolean }, string>({
      query: (num) => ({
        url: `problems/sets/${num}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: PROBLEM_SET_TAG, id: arg },
      ],
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
