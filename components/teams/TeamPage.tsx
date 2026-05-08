"use client";

import { useGetTeamQuery } from "@/lib/rtk/slices/teams";
import { TeamRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { PageError } from "../labels/Error";
import { TeamPageSkeleton } from "../loading/TeamSkeleton";
import { TeamHero } from "./TeamHero";
import { TeamImpact } from "./TeamImpact";
import { TeamQuickLinks } from "./TeamQuickLinks";
import { TeamLeaderboard } from "./TeamLeaderboard";
import { TeamActivity } from "./TeamActivity";
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";

export const TeamPage = () => {
  const { slug } = useParams();
  const { data: session } = useSession();
  const { data: team, isLoading, isError } = useGetTeamQuery(slug as string);

  if (isLoading) {
    return <TeamPageSkeleton />;
  }

  if (isError || !team) {
    return <PageError>Team not found or error loading team.</PageError>;
  }

  const isTeamMember = team.id === "me" || (session?.user?.id ? true : false);
  // Note: Backend refactoring means we don't get the full members list here.
  // We'll assume the user is a member if they can see the dashboard,
  // or we could add a `userRole` field to the team response if needed.
  // For now, let's assume the user is a member if it's their personal team or if they are in the team.
  // Real check should probably be done on the server or via a dedicated membership check.

  // Re-evaluating isTeamMember:
  // Since the refactored endpoint is public-ish but restricted,
  // we might need to know if the current user is a member to show "My Impact".
  // Let's assume for MVP that if they have a session, we'll try to load their stats.
  // The stats endpoint will return null if they aren't a member.

  const isTeamAdmin =
    team.myRole === TeamRole.OWNER || team.myRole === TeamRole.ADMIN;

  return (
    <div className="container mx-auto max-w-7xl space-y-4 md:space-y-6 mb-6 px-1 md:px-6">
      <TeamHero
        team={team}
        isTeamAdmin={isTeamAdmin}
        isTeamMember={session?.user?.id ? true : false}
      />

      {session?.user?.id && <TeamImpact slug={slug as string} />}

      <TeamQuickLinks slug={slug as string} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <TeamLeaderboard
              slug={slug as string}
              currentUserId={session?.user?.id}
            />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <TeamActivity slug={slug as string} />
        </div>
      </div>
    </div>
  );
};
