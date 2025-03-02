"use client";

import Confetti from "react-confetti-boom";
import { logStack } from "@/lib/error";
import { getRank } from "@/lib/go/display";
import {
  useGetPSetProgressQuery,
  useGetPSetQuery,
  usePSetLikeMutation,
} from "@/lib/rtk/slices/problemSets";
import { debounce } from "@/lib/utils";
import { SubmissionStatus } from "@prisma/client";
import { TrophyIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageError } from "../../labels/Error";
import { PageSpinner } from "../../labels/Spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { InfoBar } from "../InfoBar";
import { StartButton } from "../sets/StartButton";
import { useAppDispatch, useAppSelector } from "@/lib/rtk/slices/hooks";
import {
  clearCompletion,
  selectPsetCompletion,
} from "@/lib/rtk/slices/psetCompletion";

const ProblemGrid = dynamic(
  () => import("@/components/learn/problem/ProblemGrid"),
  { ssr: false, loading: () => <PageSpinner /> },
);

export function ProblemSetPage({ sId }: { sId?: string }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { psetId: completedPsetId } = useAppSelector(selectPsetCompletion);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (completedPsetId === sId) {
      setShowConfetti(true);
      console.log("Showing confetti inside useEffect");
      dispatch(clearCompletion());
    }
  }, [completedPsetId, sId]);
  const [like] = usePSetLikeMutation();
  const { status: authStatus } = useSession();
  const {
    data: pset,
    isLoading: psetLoading,
    isError: psetError,
  } = useGetPSetQuery(sId ?? "", { skip: !sId });
  const {
    data: progress,
    isLoading: pgLoading,
    isError: pgError,
  } = useGetPSetProgressQuery(sId ?? "", {
    skip: !sId || authStatus !== "authenticated",
  });
  if (psetLoading || pgLoading) {
    return <PageSpinner />;
  }
  if (psetError || !pset) {
    return <PageError>Error getting problem set</PageError>;
  }
  if (pgError) {
    return <PageError>Error getting problem set progress</PageError>;
  }
  const {
    id,
    name,
    views,
    description,
    problemCount,
    averageRank,
    completedCount,
    attemptedCount,
    author,
    problems,
  } = pset;

  const userSolved = progress?.completedCount;
  const currentSolvedCount =
    progress?.progress?.problemOrder?.reduce(
      (acc, p) => (p.status === SubmissionStatus.solved ? acc + 1 : acc),
      0,
    ) || 0;

  const handleProblemClick = (pId: string) => {
    if (!progress?.progress) {
      return;
    }
    return redirect(`/learn/sets/${id}/${pId}`);
  };

  const toggleLike = async () => {
    if (!sId) {
      return;
    }
    if (authStatus !== "authenticated") {
      toast.error("Please login to like the problem.");
      return;
    }
    const likeProblem = async () => {
      const { liked } = await like(sId).unwrap();
      return liked;
    };
    try {
      toast.promise(likeProblem, {
        loading: pset.userLiked ? "Removing like..." : "Liking problem set...",
        success: pset.userLiked ? "Removed like" : "Liked problem set",
        error: (err) => err.message,
      });
    } catch (error) {
      logStack(error);
    }
  };

  return (
    <Card className="shadow-sm rounded-lg my-6">
      <CardHeader className="p-2 sm:p-4 border-b">
        {showConfetti && (
          <div className="z-50">
            <Confetti
              x={0.4}
              effectInterval={3000}
              effectCount={5}
              particleCount={800}
              launchSpeed={2.5}
            />
          </div>
        )}
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-md sm:text-xl font-medium">{name}</span>
            {userSolved !== undefined && userSolved > 0 && (
              <div className="flex items-center text-muted-foreground">
                <TrophyIcon className="text-yellow-500" />
                <span className="text-md font-base">{userSolved}</span>
              </div>
            )}
          </div>
          <StartButton sId={sId} />
        </CardTitle>
        {description && (
          <CardDescription className="mt-2 text-xs sm:text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-2 sm:p-4 space-y-4">
        <InfoBar
          info={{
            author,
            rank: getRank(averageRank, true),
            count: problemCount,
            userLiked: pset.userLiked,
            views,
            likes: pset.likes,
            rate: completedCount / attemptedCount,
          }}
          toggleLike={debounce(toggleLike, 300)}
        />
      </CardContent>
      {progress?.progress && (
        <div className="text-sm sm:text-lg text-muted-foreground px-2 sm:px-4 text-center">
          Solved: <span className="font-semibold">{currentSolvedCount}</span> of{" "}
          <span className="font-semibold">{problemCount}</span>
        </div>
      )}
      <CardFooter className="gap-2 sm:gap-4 p-2 sm:p-4 flex flex-wrap max-h-[1/2]">
        <ProblemGrid
          problems={problems}
          progress={progress}
          onProblemClick={handleProblemClick}
        />
      </CardFooter>
    </Card>
  );
}
