"use client";
import { Spinner } from "@/components/labels/Spinner";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/isMobile";
import {
  ProblemOrderItem,
  useCreatePSetProgressMutation,
} from "@/lib/rtk/slices/problemSets";
import { CircleAlertIcon, FlameIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface StartButtonProps extends ButtonProps {
  sNum?: string;
  problemOrder?: ProblemOrderItem[];
  onCreatePSetProgress: ReturnType<typeof useCreatePSetProgressMutation>[0];
  isLoading?: boolean;
  isError?: boolean;
}

export function StartButton({
  sNum,
  problemOrder,
  onCreatePSetProgress,
  isLoading,
  isError,
  ...buttonProps
}: StartButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [randomize, setRandomize] = useState(false);

  const isMobile = useIsMobile();
  const router = useRouter();
  const { status: authStatus } = useSession();

  const getRedirectUrl = (problemOrder?: ProblemOrderItem[]) => {
    const currentProblemNum = problemOrder?.find(
      (p) => !p.status || p.status !== "solved",
    )?.problemNum;
    return currentProblemNum
      ? `/learn/sets/${sNum}/${currentProblemNum}`
      : `/learn/sets/${sNum}`;
  };

  const buttonIcon = isLoading ? (
    <Spinner className="h-4 w-4" />
  ) : (
    <FlameIcon fill="red" />
  );

  const handleClick = () => {
    if (authStatus !== "authenticated") {
      toast.error("Please login to start doing problem sets");
      return;
    }

    // If a progress exists, direct the user to continue work on it
    // Falls back to the problem set page if no problemId is found
    if (problemOrder) {
      router.push(getRedirectUrl(problemOrder));
      return;
    }

    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!sNum) {
      toast.error("Problem set number is not provided");
      return;
    }
    // No current progress exists and the user is starting a new progress
    toast.promise(onCreatePSetProgress({ id: sNum, randomize }).unwrap(), {
      error: (err) => `Failed to start problem set: ${err?.data?.message}`,
      loading: "Creating a progress record",
      success: (response) => {
        setIsDialogOpen(false);
        router.push(getRedirectUrl(response.problemOrder));
        return "Problem set started! Routing to the first problem";
      },
    });
  };

  return (
    <>
      <Button
        size={isMobile ? "sm" : "default"}
        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-800 text-white"
        disabled={isLoading || isError || !sNum}
        onClick={handleClick}
        {...buttonProps}
      >
        {problemOrder ? "Continue" : "Start"}
        {buttonIcon}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-4">
          <DialogTitle className="hidden">Start Problem Set {sNum}</DialogTitle>
          <DialogContent>
            <DialogHeader>Start Problem Set {sNum}</DialogHeader>
            <div className="text-muted-foreground text-sm">
              Ready to take on the challenge?
            </div>
            <div className="flex items-center gap-2">
              <Label>Randomize problem order</Label>
              <Switch checked={randomize} onCheckedChange={setRandomize} />
            </div>
            <DialogFooter>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleConfirm}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogContent>
        <DialogDescription className="hidden">
          Board Resize warning
        </DialogDescription>
      </Dialog>
    </>
  );
}
