"use client";

import { ProblemGridSkeleton } from "@/components/loading/ProblemGridSkeleton";
import { ProblemSetPageSkeleton } from "@/components/loading/ProblemSetPageSkeleton";
import { logStack } from "@/lib/error";
import { getRank } from "@/lib/go/display";
import { useAppDispatch, useAppSelector } from "@/lib/rtk/slices/hooks";
import {
  useCreatePSetProgressMutation,
  useGetPSetQuery,
  usePSetLikeMutation,
  usePSetStarMutation,
} from "@/lib/rtk/slices/problemSets";
import {
  selectPsetCompletion,
  setPsetCompletion,
} from "@/lib/rtk/psetCompletion";
import { debounce } from "@/lib/utils";
import { SubmissionStatus } from "@prisma/client";
import { TrophyIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti-boom";
import { toast } from "sonner";
import { PageError } from "../../labels/Error";
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
import { EndButton } from "../sets/EndButton";
import { Separator } from "@/components/ui/separator";
import { ProblemSetLeaderboard } from "../sets/ProblemSetLeaderboard";

const ProblemGrid = dynamic(
  () => import("@/components/learn/sets/ProblemGrid"),
  { ssr: false, loading: () => <ProblemGridSkeleton /> },
);

export function ProblemSetPage({ sNum }: { sNum?: string }) {
  const router = useRouter();

  const [showConfetti, setShowConfetti] = useState(false);
  const { psetId: completedPsetId } = useAppSelector(selectPsetCompletion);
  const dispatch = useAppDispatch();
  const hasShownConfetti = useRef(false);

  useEffect(() => {
    if (completedPsetId === sNum && !hasShownConfetti.current) {
      hasShownConfetti.current = true;
      setShowConfetti(true);
      toast("Congratulations 🎉", {
        icon: <TrophyIcon />,
        description:
          "You completed the problem set and earned a trophy! Keep up the great work!",
        duration: 60_000,
      });
      // Clear the completion state immediately to prevent re-triggering
      dispatch(setPsetCompletion(null));

      // Hide confetti after the animation duration (adjust timeout as needed)
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [completedPsetId, sNum, dispatch]);

  const [like, { isLoading: lLoading }] = usePSetLikeMutation();
  const [star, { isLoading: sLoading }] = usePSetStarMutation();
  const { status: authStatus } = useSession();
  const {
    data: pset,
    isLoading: psetLoading,
    isError: psetError,
  } = useGetPSetQuery(sNum ?? "", { skip: !sNum });
  const [createPSetProgress, { isLoading: cLoading, isError: cError }] =
    useCreatePSetProgressMutation();
  const isLoading = cLoading || psetLoading || authStatus === "loading";
  const isError = cError || psetError;

  if (isLoading) {
    return <ProblemSetPageSkeleton />;
  }
  if (isError || !pset) {
    return <PageError>Error getting problem set</PageError>;
  }

  const {
    num,
    name,
    views,
    description,
    problemCount,
    averageRank,
    completedCount,
    author,
    problems,
    leaderboard,
  } = pset;

  const userSolved = pset?.userCompletions;

  const currentSolvedCount =
    pset?.userProgress?.problemOrder?.reduce(
      (acc, p) => (p.status === SubmissionStatus.solved ? acc + 1 : acc),
      0,
    ) || 0;

  const handleProblemClick = (pNum: string) => {
    if (!pset?.userProgress) {
      return router.push(`/learn/problems/${pNum}`);
    }
    return router.push(`/learn/sets/${num}/${pNum}`);
  };

  const toggleLike = async () => {
    if (!sNum) {
      return;
    }
    if (authStatus !== "authenticated") {
      toast("Please sign in to like the problem set", {
        action: {
          label: "Sign in",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }
    const likeProblem = async () => {
      const { liked } = await like(sNum).unwrap();
      return liked;
    };
    toast.promise(likeProblem, {
      loading: pset.userLiked ? "Removing like..." : "Liking problem set...",
      success: pset.userLiked ? "Removed like" : "Liked problem set",
      error: (err) => err.data?.message,
    });
  };

  const toggleStar = async () => {
    if (!sNum) {
      return;
    }
    if (authStatus !== "authenticated") {
      toast("Please sign in to star the problem set", {
        action: {
          label: "Sign in",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }
    const starProblem = async () => {
      const { starred } = await star(sNum).unwrap();
      return starred;
    };
    toast.promise(starProblem, {
      loading: pset.userStarred
        ? "Removing problem set from favorites..."
        : "Adding problem set to favorites...",
      success: pset.userStarred
        ? "Removed problem set from favorites"
        : "Added problem set to favorites",
      error: (err) => err.data?.message,
    });
  };

  return (
    <>
      <Card className="container mx-auto max-w-7xl shadow-sm rounded-lg my-1 sm:my-2 md:my-4">
        <CardHeader className="p-2 sm:p-4 md:p-6 border-b">
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
            <div className="flex items-center gap-4">
              {pset?.userProgress && <EndButton sNum={sNum} />}
              <StartButton
                onCreatePSetProgress={createPSetProgress}
                isLoading={isLoading}
                isError={isError}
                sNum={sNum}
                problemOrder={pset?.userProgress?.problemOrder}
              />
            </div>
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
              userStarred: pset.userStarred,
              views,
              likes: pset.likes,
              rate: completedCount,
              userSolved: userSolved !== undefined && userSolved > 0,
            }}
            toggleLike={debounce(toggleLike, 300)}
            toggleStar={debounce(toggleStar, 300)}
            likeDisabled={lLoading}
            starDisabled={sLoading}
          />
        </CardContent>
        {pset?.userProgress && (
          <div className="text-sm sm:text-lg text-muted-foreground px-2 sm:px-4 text-center">
            Solved: <span className="font-semibold">{currentSolvedCount}</span>{" "}
            of <span className="font-semibold">{problemCount}</span>
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
      <ProblemSetLeaderboard
        className="container mx-auto max-w-7xl mb-8"
        leaderboard={leaderboard}
        problemCount={problemCount}
      />
    </>
  );
}
