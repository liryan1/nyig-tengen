"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamResponse } from "@/lib/rtk/slices/teams";
import { UserPlus2, Users, FolderOpen, Puzzle } from "lucide-react";
import { InviteMember } from "./InviteMember";

interface TeamHeroProps {
  team: TeamResponse;
  isTeamAdmin: boolean;
  isTeamMember: boolean;
}

// Generate a consistent gradient based on the team slug
const getGradient = (slug: string) => {
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-blue-500",
  ];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const TeamHero = ({
  team,
  isTeamAdmin,
  isTeamMember,
}: TeamHeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow">
      <div
        className={`h-32 w-full bg-gradient-to-r ${getGradient(team.slug)} opacity-80`}
      />
      <div className="p-6 pt-0 -mt-10 relative">
        <div className="flex justify-between items-end gap-4">
          <div className="space-y-2">
            <div className="bg-background p-1 rounded-lg inline-block shadow-sm">
              <div
                className={`h-16 w-16 rounded-md bg-gradient-to-br ${getGradient(team.slug)} flex items-center justify-center text-white text-2xl font-bold`}
              >
                {team.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
              <p className="text-muted-foreground max-w-2xl">
                {team.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{team.memberCount} Members</span>
              </div>
              <div className="flex items-center gap-1">
                <Puzzle className="h-4 w-4" />
                <span>{team.problemCount} Problems</span>
              </div>
              <div className="flex items-center gap-1">
                <FolderOpen className="h-4 w-4" />
                <span>{team.problemSetCount} Sets</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mr-[-10px] mb-[-10px]">
            {!isTeamMember && (
              <Button variant="default">
                <UserPlus2 className="h-4 w-4" />
                Request to Join
              </Button>
            )}
            {isTeamAdmin && <InviteMember teamSlug={team.slug} />}
          </div>
        </div>
      </div>
    </div>
  );
};
