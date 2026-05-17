"use client";

import { useGetTeamQuery } from "@/lib/rtk/slices/teams";
import { useSession } from "next-auth/react";
import { TeamHero } from "@/components/teams/TeamHero";
import { ManageMembers } from "@/components/teams/ManageMembers";
import { TeamPageSkeleton } from "@/components/loading/TeamSkeleton";
import { PageError } from "@/components/labels/Error";
import { TeamRole } from "@prisma/client";

export default function TeamMembersClient({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const { data: team, isLoading, isError } = useGetTeamQuery(slug);

  if (isLoading) {
    return <TeamPageSkeleton />;
  }

  if (isError || !team) {
    return <PageError>Team not found or error loading team.</PageError>;
  }

  const isTeamAdmin =
    team.myRole === TeamRole.OWNER || team.myRole === TeamRole.ADMIN;

  if (!isTeamAdmin) {
    return <PageError>You do not have permission to manage members.</PageError>;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-4 md:space-y-6 mb-6 px-4 md:px-6">
      <TeamHero team={team} isTeamAdmin={isTeamAdmin} isTeamMember={true} />
      <ManageMembers
        slug={slug}
        myRole={team.myRole}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
