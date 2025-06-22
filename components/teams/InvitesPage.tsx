"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetTeamInvitesQuery,
  useRespondToInviteMutation,
} from "@/lib/rtk/slices/teams";
import { InviteStatus, InviteType } from "@prisma/client";
import { CheckIcon, XIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { PageError } from "../labels/Error";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function InvitesPage() {
  const { data: session } = useSession();
  const {
    data: invites,
    isLoading,
    isError,
  } = useGetTeamInvitesQuery(undefined, {
    skip: !session?.user.id,
  });
  const [respondToInvite, { isLoading: responding }] =
    useRespondToInviteMutation();

  if (isLoading) return <div>Loading invitations...</div>;
  if (isError || !invites)
    return <PageError>Failed to load invitations</PageError>;

  if (!session?.user?.id) {
    return <PageError>Please login to access this page</PageError>;
  }

  const received = invites.filter((inv) => inv.type === InviteType.INVITE);

  const handleRespond = async (slug: string, action: InviteStatus) => {
    try {
      await respondToInvite({ slug, action }).unwrap();
      toast.success(`Invite ${action.toLowerCase()}`);
    } catch {
      toast.error(`Failed to ${action.toLowerCase()} invite`);
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Team Invitations</h1>

      <Card>
        <CardHeader>
          <CardTitle>Invitations To You</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {received.length === 0 ? (
            <p className="text-muted-foreground">No pending invites.</p>
          ) : (
            received.map((inv, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {inv.team.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{inv.team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited by {inv.createdBy.name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleRespond(inv.team.slug, InviteStatus.ACCEPTED)
                    }
                    disabled={responding}
                  >
                    Accept
                    <CheckIcon className="ml-1 h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      handleRespond(inv.team.slug, InviteStatus.DECLINED)
                    }
                    disabled={responding}
                  >
                    Decline
                    <XIcon className="ml-1 h-4 w-4" />
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
