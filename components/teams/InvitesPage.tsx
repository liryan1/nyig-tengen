"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetTeamInvitesQuery,
  useRespondToInviteMutation,
} from "@/lib/rtk/slices/teams";
import { InviteStatus, InviteType } from "@prisma/client";
import { CheckIcon, XIcon, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { PageError } from "../labels/Error";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { PageSpinner } from "../labels/Spinner";

export function InvitesPage() {
  const { data: session } = useSession();
  const {
    data: invites,
    isLoading,
    isError,
  } = useGetTeamInvitesQuery(undefined, {
    skip: !session?.user?.id,
  });
  const [respondToInvite, { isLoading: responding }] =
    useRespondToInviteMutation();

  if (isLoading) return <PageSpinner />;
  if (isError || !invites)
    return <PageError>Failed to load invitations</PageError>;

  if (!session?.user?.id) {
    return <PageError>Please login to access this page</PageError>;
  }

  const received = invites.filter((inv) => inv.type === InviteType.INVITE);

  const handleRespond = async (slug: string, action: InviteStatus) => {
    try {
      await respondToInvite({ slug, action }).unwrap();
      toast.success(`Invite ${action.toLowerCase()} successfully`);
    } catch {
      toast.error(`Failed to ${action.toLowerCase()} invite`);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-4 md:space-y-6 mb-6 px-4 md:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Team Invitations
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Manage pending invites to join new teams.
        </p>
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invitations For You
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-3">
          {received.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-sm">
                No pending invitations at the moment.
              </p>
            </div>
          ) : (
            received.map((inv, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border bg-card p-3 md:p-4 shadow-sm hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 md:h-10 md:w-10 ring-2 ring-background">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm font-bold">
                      {inv.team.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-bold text-sm md:text-base truncate">
                      {inv.team.name}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      Invited by{" "}
                      <span className="text-foreground font-medium">
                        {inv.createdBy.name}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="flex-1 sm:flex-none h-8 md:h-9 text-xs md:text-sm"
                    onClick={() =>
                      handleRespond(inv.team.slug, InviteStatus.ACCEPTED)
                    }
                    disabled={responding}
                  >
                    Accept
                    <CheckIcon className="ml-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 sm:flex-none h-8 md:h-9 text-xs md:text-sm"
                    onClick={() =>
                      handleRespond(inv.team.slug, InviteStatus.DECLINED)
                    }
                    disabled={responding}
                  >
                    Decline
                    <XIcon className="ml-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
