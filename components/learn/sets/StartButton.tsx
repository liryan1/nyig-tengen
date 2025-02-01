"use client";
import { Spinner } from "@/components/labels/Spinner";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  PSetProgressResponse,
  useCreatePSetProgressMutation,
  useGetPSetProgressQuery,
} from "@/lib/rtk/slices/problemSets";
import { FlameIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface StartButtonProps extends ButtonProps {
  sId?: string;
}

export function StartButton({ sId, ...buttonProps }: StartButtonProps) {
  const router = useRouter();
  const {
    data: progress,
    isLoading: pgLoading,
    isError: pgError,
  } = useGetPSetProgressQuery(sId ?? "", { skip: !sId });
  const [create, { isLoading: cLoading, isError: cError }] =
    useCreatePSetProgressMutation();
  const isLoading = pgLoading || cLoading;

  const getRedirectUrl = (progress?: PSetProgressResponse) => {
    const currentProblemId = progress?.problemOrder?.find(
      (p) => p.status !== "solved",
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
    // If a progress exists, direct the user continues to work on it
    // Falls back to the problem set page if no problemId is found
    if (progress?.progress) {
      router.push(getRedirectUrl(progress.progress));
      return;
    }
    // No current progress exists and the user is starting a new progress
    const response = await create({ id: sId ?? "" }).unwrap();
    router.push(getRedirectUrl(response.progress));
  };

  return (
    <Button
      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-800"
      disabled={isLoading || pgError || cError || !sId}
      onClick={handleClick}
      {...buttonProps}
    >
      {progress?.progress ? "Continue" : "Start"}
      {icon}
    </Button>
  );
}
