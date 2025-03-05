"use client";
import { Spinner } from "@/components/labels/Spinner";
import { Button, ButtonProps } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/isMobile";
import {
  ProblemOrderItem,
  useCreatePSetProgressMutation,
} from "@/lib/rtk/slices/problemSets";
import { FlameIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const isMobile = useIsMobile();
  const { status: authStatus } = useSession();
  const router = useRouter();

  // const [create, { isLoading: cLoading, isError: cError }] =
  //   useCreatePSetProgressMutation();
  // const isLoading = cLoading || authStatus === "loading";

  const getRedirectUrl = (problemOrder?: ProblemOrderItem[]) => {
    const currentProblemNum = problemOrder?.find(
      (p) => !p.status || p.status !== "solved",
    )?.problemNum;
    return currentProblemNum
      ? `/learn/sets/${sNum}/${currentProblemNum}`
      : `/learn/sets/${sNum}`;
  };

  const icon = isLoading ? (
    <Spinner className="h-4 w-4" />
  ) : (
    <FlameIcon fill="red" />
  );
  const handleClick = async () => {
    if (authStatus !== "authenticated") {
      toast.error("Please login to start doing problem sets");
      return;
    }
    if (!sNum) {
      toast.error("Problem set number is not provided");
      return;
    }
    // If a progress exists, direct the user continues to work on it
    // Falls back to the problem set page if no problemId is found
    if (problemOrder) {
      router.push(getRedirectUrl(problemOrder));
      return;
    }
    // No current progress exists and the user is starting a new progress
    const response = await onCreatePSetProgress({ id: sNum }).unwrap();
    router.push(getRedirectUrl(response.problemOrder));
  };

  return (
    <Button
      size={isMobile ? "sm" : "default"}
      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-800 text-white"
      disabled={isLoading || isError || !sNum}
      onClick={handleClick}
      {...buttonProps}
    >
      {problemOrder ? "Continue" : "Start"}
      {icon}
    </Button>
  );
}
