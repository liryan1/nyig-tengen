import { InviteStatus, InviteType, TeamRole, TeamStatus } from "@prisma/client";
import { apiSlice, TEAM_INVITES_TAG, TEAMS_TAG } from "../api";
import { GoProblemResponse } from "@/lib/go/interface";
import { ProblemSetResponse } from "./problemSets";

export interface TeamResponse {
  id: string;
  slug: string;
  name: string;
  description?: string;
  memberCount: number;
  problemCount: number;
  problemSetCount: number;
  owner: {
    id: string;
    name: string;
  };
  myRole?: TeamRole | null;
  members?: {
    id: string;
    name: string;
    role: TeamRole;
    joinedAt?: string;
  }[];
  problems?: GoProblemResponse[];
  problemSets?: ProblemSetResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamStatsMeResponse {
  problemsSolved: number;
  totalTeamProblems: number;
  setsCompleted: number;
  totalTeamSets: number;
  topRankedSet?: {
    name: string;
    rank: number;
  };
}

export interface TeamLeaderboardEntry {
  id: string;
  name: string;
  assignedName?: string | null;
  role: TeamRole;
  joinedAt: string;
  problemsSolved: number;
  setsCompleted: number;
}

export interface TeamLeaderboardResponse {
  currentPage: number;
  totalPages: number;
  members: TeamLeaderboardEntry[];
}

export interface TeamActivityItem {
  id: string;
  type: "member_joined" | "problem_added" | "pset_added";
  user?: { name: string };
  contentName?: string;
  createdAt: string;
}

export interface TeamMemberResponse {
  id: string;
  name: string;
  assignedName?: string | null;
  image?: string;
  role: TeamRole;
  joinedAt: string;
}

export interface GetTeamMembersResponse {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  members: TeamMemberResponse[];
}

export interface MyTeamsResponse {
  slug: string;
  name: string;
}

export interface TeamInviteResponse {
  id: string;
  team: { slug: string; name: string };
  user: { id: string; name: string };
  createdBy: { id: string; name: string };
  type: InviteType;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  user: {
    id: string;
    name: string;
  };
}

export interface TeamInvite {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  status: InviteStatus;
}

export interface GetTeamsResponse {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalTeams: number;
  teams: TeamResponse[];
}

export interface TeamCreateRequest {
  name: string;
  description?: string;
}

export interface TeamCreateResponse {
  slug: string;
}

const teamsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query<
      GetTeamsResponse,
      { page?: number; limit?: number; id?: string } | void
    >({
      query: (qs) =>
        `teams?page=${qs?.page ?? 1}&limit=${qs?.limit ?? 5}${qs?.id ? "&include=" : ""}`,
      providesTags: [TEAMS_TAG],
    }),

    getTeam: builder.query<TeamResponse, string>({
      query: (slug) => `teams/${slug}`,
      providesTags: (result, error, arg) => [{ type: TEAMS_TAG, id: arg }],
    }),

    getTeamStatsMe: builder.query<
      TeamStatsMeResponse,
      { slug: string; period?: string }
    >({
      query: ({ slug, period = "all" }) =>
        `teams/${slug}/stats/me?period=${period}`,
    }),

    getTeamLeaderboard: builder.query<
      TeamLeaderboardResponse,
      { slug: string; page?: number; limit?: number }
    >({
      query: ({ slug, page = 1, limit = 10 }) =>
        `teams/${slug}/leaderboard?page=${page}&limit=${limit}`,
    }),

    getTeamActivity: builder.query<TeamActivityItem[], string>({
      query: (slug) => `teams/${slug}/activity`,
    }),

    getTeamMembers: builder.query<
      GetTeamMembersResponse,
      { slug: string; page?: number; limit?: number; search?: string }
    >({
      query: ({ slug, page = 1, limit = 20, search = "" }) =>
        `teams/${slug}/members?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      providesTags: (result, error, arg) => [{ type: TEAMS_TAG, id: arg.slug }],
    }),

    updateTeamMember: builder.mutation<
      void,
      {
        slug: string;
        userId: string;
        role?: TeamRole;
        assignedName?: string | null;
      }
    >({
      query: ({ slug, userId, ...body }) => ({
        url: `teams/${slug}/members/${userId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: TEAMS_TAG, id: arg.slug },
      ],
    }),

    getMyTeams: builder.query<MyTeamsResponse[], void>({
      query: () => `teams/my-teams`,
      providesTags: [TEAMS_TAG],
    }),

    getTeamInvites: builder.query<TeamInviteResponse[], void>({
      query: () => `teams/invites`,
      providesTags: [TEAM_INVITES_TAG],
    }),

    createTeam: builder.mutation<TeamCreateResponse, TeamCreateRequest>({
      query: (body) => ({
        url: "teams",
        method: "POST",
        body,
      }),
      invalidatesTags: [TEAMS_TAG],
    }),

    updateTeam: builder.mutation<
      void,
      { slug: string; name: string; description?: string }
    >({
      query: ({ slug, ...body }) => ({
        url: `teams/${slug}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: TEAMS_TAG, id: arg.slug },
      ],
    }),

    inviteMembers: builder.mutation<
      void,
      { slug: string; users: string[]; role?: TeamRole }
    >({
      query: ({ slug, ...body }) => ({
        url: `teams/${slug}/invite`,
        method: "POST",
        body,
      }),
    }),

    respondToInvite: builder.mutation<
      void,
      { slug: string; action: InviteStatus }
    >({
      query: ({ slug, ...body }) => ({
        url: `teams/${slug}/invite/respond`,
        method: "POST",
        body,
      }),
      invalidatesTags: [TEAM_INVITES_TAG, TEAMS_TAG],
    }),

    requestToJoinTeam: builder.mutation<void, string>({
      query: (slug) => ({
        url: `teams/${slug}/request`,
        method: "POST",
      }),
    }),

    respondToJoinRequest: builder.mutation<
      void,
      { slug: string; inviteId: string; action: InviteStatus }
    >({
      query: ({ slug, inviteId, ...body }) => ({
        url: `teams/${slug}/request/${inviteId}/respond`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: TEAMS_TAG, id: arg.slug },
      ],
    }),

    getInviteCandidates: builder.query<
      { name: string; email: string }[],
      { slug: string; search?: string }
    >({
      query: ({ slug, search }) =>
        `teams/${slug}/invitees${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetMyTeamsQuery,
  useGetTeamQuery,
  useGetTeamStatsMeQuery,
  useGetTeamLeaderboardQuery,
  useGetTeamActivityQuery,
  useGetTeamMembersQuery,
  useUpdateTeamMemberMutation,
  useCreateTeamMutation,
  useUpdateTeamMutation,

  useGetTeamInvitesQuery,

  useInviteMembersMutation,
  useRespondToInviteMutation,
  useRequestToJoinTeamMutation,
  useRespondToJoinRequestMutation,

  useGetInviteCandidatesQuery,
} = teamsApiSlice;
