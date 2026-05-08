import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useRequestToJoinTeamMutation,
  useRespondToInviteMutation,
  TeamResponse,
} from "@/lib/rtk/slices/teams";
import {
  UserPlus2,
  Users,
  FolderOpen,
  Puzzle,
  Settings2,
  CheckCircle2,
  Clock,
  CheckIcon,
} from "lucide-react";
import { InviteMember } from "./InviteMember";
import Link from "next/link";
import { toast } from "sonner";
import { InviteStatus, InviteType } from "@prisma/client";

interface TeamHeroProps {
  team: TeamResponse;
  isTeamAdmin: boolean;
  isTeamMember: boolean;
}

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
  const [requestToJoin, { isLoading: isRequesting }] =
    useRequestToJoinTeamMutation();
  const [respondToInvite, { isLoading: isResponding }] =
    useRespondToInviteMutation();

  const handleJoinRequest = async () => {
    try {
      await requestToJoin(team.slug).unwrap();
      toast.success("Join request sent successfully!");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to send join request.");
    }
  };

  const handleAcceptInvite = async () => {
    try {
      await respondToInvite({
        slug: team.slug,
        action: InviteStatus.ACCEPTED,
      }).unwrap();
      toast.success("Joined team successfully!");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to join team.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div
        className={`h-24 md:h-32 w-full bg-gradient-to-r ${getGradient(team.slug)} opacity-80`}
      />
      <div className="p-4 md:p-6 pt-0 md:pt-0 -mt-8 md:-mt-10 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-1.5 md:space-y-2">
            <Link
              href={`/teams/${team.slug}`}
              className="inline-block transition-transform hover:scale-105 active:scale-95"
            >
              <div className="bg-background p-1 rounded-lg inline-block shadow-sm">
                <div
                  className={`h-12 w-12 md:h-16 md:w-16 rounded-md bg-gradient-to-br ${getGradient(team.slug)} flex items-center justify-center text-white text-xl md:text-2xl font-bold`}
                >
                  {team.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/teams/${team.slug}`}
                  className="hover:underline underline-offset-4 decoration-primary/30"
                >
                  <h1 className="text-xl md:text-3xl font-bold tracking-tight inline-block">
                    {team.name}
                  </h1>
                </Link>
                {isTeamMember && (
                  <Badge
                    variant="secondary"
                    className="hidden md:flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Member
                  </Badge>
                )}
                {team.hasPendingRequest && (
                  <Badge
                    variant="outline"
                    className="hidden md:flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />{" "}
                    {team.pendingInviteType === InviteType.INVITE
                      ? "Invited"
                      : "Requested"}
                  </Badge>
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground max-w-2xl line-clamp-2 md:line-clamp-none">
                {team.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] md:text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span>{team.memberCount} Members</span>
              </div>
              <div className="flex items-center gap-1">
                <Puzzle className="h-3 w-3 md:h-4 md:w-4" />
                <span>{team.problemCount} Problems</span>
              </div>
              <div className="flex items-center gap-1">
                <FolderOpen className="h-3 w-3 md:h-4 md:w-4" />
                <span>{team.problemSetCount} Sets</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {!isTeamMember && !team.hasPendingRequest && (
              <Button
                variant="default"
                size="sm"
                className="flex-1 sm:flex-none h-8 md:h-10 text-xs md:text-sm"
                onClick={handleJoinRequest}
                disabled={isRequesting}
              >
                <UserPlus2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Request to Join
              </Button>
            )}
            {!isTeamMember &&
              team.hasPendingRequest &&
              team.pendingInviteType === InviteType.INVITE && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 sm:flex-none h-8 md:h-10 text-xs md:text-sm bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleAcceptInvite}
                  disabled={isResponding}
                >
                  <CheckIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Accept Invitation
                </Button>
              )}
            {!isTeamMember &&
              team.hasPendingRequest &&
              team.pendingInviteType === InviteType.REQUEST && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none h-8 md:h-10 text-xs md:text-sm cursor-not-allowed"
                  disabled
                >
                  <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Pending Approval
                </Button>
              )}
            {isTeamAdmin && (
              <>
                <Link
                  href={`/teams/${team.slug}/members`}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 md:h-10 text-xs md:text-sm"
                  >
                    <Settings2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Manage Members
                  </Button>
                </Link>
                <div className="flex-1 sm:flex-none">
                  <InviteMember teamSlug={team.slug} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
