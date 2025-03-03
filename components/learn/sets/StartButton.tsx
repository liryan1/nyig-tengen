"use client";
import { Spinner } from "@/components/labels/Spinner";
import { Button, ButtonProps } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/isMobile";
import {
  ProblemOrderItem,
  PSetProgressResponse,
  useCreatePSetProgressMutation,
  useGetPSetProgressQuery,
} from "@/lib/rtk/slices/problemSets";
import { FlameIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface StartButtonProps extends ButtonProps {
  sId?: string;
  problemOrder?: ProblemOrderItem[];
}

export function StartButton({
  sId,
  problemOrder,
  ...buttonProps
}: StartButtonProps) {
  const isMobile = useIsMobile();
  const { status: authStatus } = useSession();
  const router = useRouter();

  const [create, { isLoading: cLoading, isError: cError }] =
    useCreatePSetProgressMutation();
  const isLoading = cLoading || authStatus === "loading";

  const getRedirectUrl = (problemOrder?: ProblemOrderItem[]) => {
    const currentProblemId = problemOrder?.find(
      (p) => !p.status || p.status !== "solved",
    )?.problemId;
    return currentProblemId
      ? `/learn/sets/${sId}/${currentProblemId}`
      : `/learn/sets/${sId}`;
  };

  const icon = isLoading ? (
    <Spinner className="h-4 w-4" />
  ) : (
    <FlameIcon fill="red" />
  );
  const handleClick = async () => {
    if (authStatus !== "authenticated") {
      toast.error("Please login to start problem sets");
      return;
    }
    // If a progress exists, direct the user continues to work on it
    // Falls back to the problem set page if no problemId is found
    if (problemOrder) {
      router.push(getRedirectUrl(problemOrder));
      return;
    }
    // No current progress exists and the user is starting a new progress
    const response = await create({ id: sId ?? "" }).unwrap();
    router.push(getRedirectUrl(response.problemOrder));
  };

  return (
    <Button
      size={isMobile ? "sm" : "default"}
      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-800 text-white"
      disabled={isLoading || cError || !sId}
      onClick={handleClick}
      {...buttonProps}
    >
      {problemOrder ? "Continue" : "Start"}
      {icon}
    </Button>
  );
}
