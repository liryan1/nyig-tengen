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
import { useIsMobile } from "@/hooks/isMobile";
import { useEndPSetProgressMutation } from "@/lib/rtk/slices/problemSets";
import { CircleAlertIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface EndButtonProps extends ButtonProps {
  sNum?: string;
}

export function EndButton({ sNum, ...buttonProps }: EndButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const { status: authStatus } = useSession();

  const [endPSetProgress, { isLoading, isError }] =
    useEndPSetProgressMutation();

  const handleClick = () => {
    if (authStatus !== "authenticated") {
      toast("Please sign in to manage problem sets", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      });
      return;
    }
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!sNum) {
      toast.error("Problem set number is not provided");
      return;
    }
    toast.promise(endPSetProgress(sNum).unwrap(), {
      loading: "Ending your progress…",
      success: () => {
        setIsDialogOpen(false);
        router.push(`/learn/sets/${sNum}`);
        return "Progress ended.";
      },
      error: (err) =>
        `Failed to end progress: ${err?.data?.message ?? "Unknown error"}`,
    });
  };

  return (
    <>
      <Button
        size={isMobile ? "sm" : "default"}
        variant="destructive"
        className="flex items-center gap-1"
        disabled={isLoading || isError || !sNum}
        onClick={handleClick}
        {...buttonProps}
      >
        Give up
        {isLoading ? <Spinner className="h-4 w-4" /> : <CircleAlertIcon />}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-4">
          <DialogTitle className="hidden">
            Abandon Problem Set {sNum}
          </DialogTitle>
          <DialogContent>
            <DialogHeader>Abandon Problem Set {sNum}</DialogHeader>
            <div className="text-muted-foreground text-sm">
              This will clear all your existing progress. You can start again
              later.
            </div>
            <DialogFooter>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleConfirm}>
                Confirm
                {isLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <CircleAlertIcon />
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogContent>
        <DialogDescription className="hidden">
          Abandon progress confirmation
        </DialogDescription>
      </Dialog>
    </>
  );
}
