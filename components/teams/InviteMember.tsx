import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useGetInviteCandidatesQuery,
  useInviteMembersMutation,
} from "@/lib/rtk/slices/teams";
import { CirclePlusIcon, SendHorizonalIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../labels/Spinner";
import { MultiSelect, MultiSelectOption } from "../ui/multiselect";

interface InviteMemberProps {
  teamSlug: string;
}

export function InviteMember({ teamSlug }: InviteMemberProps) {
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<MultiSelectOption[]>([]);
  const { data: candidates, isLoading: cLoading } = useGetInviteCandidatesQuery(
    { slug: teamSlug ?? "" },
    { skip: !teamSlug },
  );
  const [inviteMember, { isLoading: iLoading }] = useInviteMembersMutation();
  const isLoading = cLoading || iLoading;

  const options = (candidates ?? []).map((user) => ({
    value: user.email,
    label: `${user.name} (${user.email})`,
  }));

  const handleInvite = async () => {
    const invite = async () => {
      await inviteMember({
        slug: teamSlug,
        users: selectedUsers.map((selected) => selected.value),
      }).unwrap();
    };
    if (selectedUsers.length === 0) {
      return;
    }
    toast.promise(invite, {
      loading: `Inviting ${selectedUsers.length} users`,
      success: () => {
        setSelectedUsers([]);
        setOpen(false);
        if (selectedUsers.length > 1) {
          `Successfully invited ${selectedUsers.length} users!`;
        }
        return `Successfully invited ${selectedUsers[0]}`;
      },
      error: (err) => `Invite failed: ${err.data?.message}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Invite <CirclePlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-4">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Select users to invite</p>
        <MultiSelect
          placeholder="Find members"
          options={options}
          selected={selectedUsers}
          onChange={setSelectedUsers}
        />
        <div className="flex justify-end gap-2 mt-8">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="gap-1"
            onClick={handleInvite}
            disabled={isLoading || !selectedUsers.length}
          >
            Invite
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <SendHorizonalIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
      <DialogDescription className="hidden">
        Invite users to join your team
      </DialogDescription>
    </Dialog>
  );
}
