"use client";

import { logStack } from "@/lib/error";
import { getRank } from "@/lib/go/display";
import { useAppDispatch, useAppSelector } from "@/lib/rtk/slices/hooks";
import {
  useGetPSetQuery,
  usePSetLikeMutation,
} from "@/lib/rtk/slices/problemSets";
import {
  selectPsetCompletion,
  setPsetCompletion,
} from "@/lib/rtk/slices/psetCompletion";
import { debounce } from "@/lib/utils";
import { SubmissionStatus } from "@prisma/client";
import { TrophyIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Confetti from "react-confetti-boom";
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
import { ProblemSetCardSkeleton } from "@/components/loading/ProblemSetCardSkeleton";

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
      dispatch(setPsetCompletion(null));
    }
  }, [completedPsetId, sId]);
  const [like] = usePSetLikeMutation();
  const { status: authStatus } = useSession();
  const {
    data: pset,
    isLoading: psetLoading,
    isError: psetError,
  } = useGetPSetQuery(sId ?? "", { skip: !sId });

  if (psetLoading) {
    return <ProblemSetCardSkeleton />;
  }
  if (psetError || !pset) {
    return <PageError>Error getting problem set</PageError>;
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

  const userSolved = pset?.userCompletions;

  const currentSolvedCount =
    pset?.userProgress?.problemOrder?.reduce(
      (acc, p) => (p.status === SubmissionStatus.solved ? acc + 1 : acc),
      0,
    ) || 0;

  const handleProblemClick = (pId: string) => {
    if (!pset?.userProgress) {
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
            <span className="text-lg md:text-2xl font-semibold">{name}</span>
            {userSolved !== undefined && userSolved > 0 && (
              <div className="flex items-center text-muted-foreground">
                <TrophyIcon className="text-yellow-500" />
                <span className="text-md font-base">{userSolved}</span>
              </div>
            )}
          </div>
          <StartButton
            sId={sId}
            problemOrder={pset?.userProgress?.problemOrder}
          />
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
      {pset?.userProgress && (
        <div className="text-sm sm:text-lg text-muted-foreground px-2 sm:px-4 text-center">
          Solved: <span className="font-semibold">{currentSolvedCount}</span> of{" "}
          <span className="font-semibold">{problemCount}</span>
        </div>
      )}
      <CardFooter className="gap-2 sm:gap-4 p-2 sm:p-4 flex flex-wrap max-h-[1/2]">
        <ProblemGrid
          problems={problems}
          problemOrder={pset?.userProgress?.problemOrder}
          onProblemClick={handleProblemClick}
        />
      </CardFooter>
    </Card>
  );
}
