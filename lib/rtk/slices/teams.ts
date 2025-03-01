import { InviteStatus, TeamRole } from "@prisma/client";
import { apiSlice, TEAMS_TAG } from "../api";

export interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  problemCount: number;
  problemSetCount: number;
  owner: {
    id: string;
    name: string;
  };
  members?: { id: string; name: string; role: TeamRole; joinedAt: string }[];
  problems?: { id: string; rank: number }[];
  problemSets?: { id: string; name: string; problemCount: number }[];
  createdAt?: string;
  updatedAt?: string;
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
  teams: Team[];
}

export interface TeamCreateRequest {
  name: string;
  description?: string;
}

export interface TeamCreateResponse {
  id: string;
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

    getTeam: builder.query<Team, string>({
      query: (slug) => `teams/${slug}`,
      providesTags: [TEAMS_TAG],
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
      { id: string; name: string; description?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `teams/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [TEAMS_TAG],
    }),

    deleteTeam: builder.mutation<void, string>({
      query: (id) => ({
        url: `teams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TEAMS_TAG],
    }),

    getTeamMembers: builder.query<TeamMember[], string>({
      query: (teamId) => `teams/${teamId}/members`,
      providesTags: [TEAMS_TAG],
    }),

    inviteMember: builder.mutation<
      void,
      { teamId: string; email: string; role: string }
    >({
      query: ({ teamId, ...body }) => ({
        url: `teams/${teamId}/invite`,
        method: "POST",
        body,
      }),
      invalidatesTags: [TEAMS_TAG],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useGetTeamMembersQuery,
  useInviteMemberMutation,
} = teamsApiSlice;
