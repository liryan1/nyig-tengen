"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/isMobile";
import { useChallenge } from "@/hooks/useChallenge";
import {
  useChallengeSubmitMutation,
  useStartChallengeQuery,
} from "@/lib/rtk/slices/challenge";
import { FileWarningIcon, Loader2, PlayCircle } from "lucide-react";
import { useState } from "react";
import Confetti from "react-confetti-boom";
import { toast } from "sonner";
import { ActionsDisplay } from "./display/ActionsDisplay";
import { BoardDisplay } from "./display/BoardDisplay";
import { ChallengeComplete } from "./display/ChallengeComplete";
import { TimerDisplay } from "./display/TimeDisplay";

export function ChallengeScreen() {
  const isMobile = useIsMobile();
  const [hasStarted, setHasStarted] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const {
    data,
    isLoading: startLoading,
    isError,
    isFetching,
    refetch,
  } = useStartChallengeQuery(undefined);
  const [submit, { isLoading: submitLoading }] = useChallengeSubmitMutation();
  const [newPersonalBest, setNewPersonalBest] = useState(0);
  const isLoading = startLoading || submitLoading || isFetching;

  const [showConfetti, setShowConfetti] = useState(false);

  const handleChallengeEnded = async () => {
    const attemptId = data?.attemptId;
    if (!attemptId) {
      console.error("Unable to find attempt to update");
      return;
    }

    const callback = async () => {
      if (problemsCorrect >= 1) {
        const newPersonalBest = await submit({
          attemptId,
          timeSpentMs: totalRunTimeMs,
          score: problemsCorrect,
        }).unwrap();
        setShowConfetti(true);
        setNewPersonalBest(newPersonalBest.problemsCorrect);
      }
    };
    toast.promise(callback, {
      loading: "Submitting results to high scores...",
      success: () => "Keep practicing 💪",
      error: (err) => `Failed to submit results: ${err.data?.message}`,
    });
    if (showConfetti) {
      setShowConfetti(false);
    }
    setShowCompleted(true);
  };

  const {
    currentProblem,
    remainingTimeMs,
    totalRunTimeMs,
    problemsCorrect,
    isSubmitting,
    ended,
    answer,
    reset,
    start,
  } = useChallenge({
    startChallengeResponse: data,
    onChallengeEnded: handleChallengeEnded,
  });

  const handleStart = () => {
    start();
    setHasStarted(true);
  };

  const handleTryAgain = () => {
    try {
      refetch();
      reset();
      setShowCompleted(false);
      setHasStarted(false);
    } catch (error) {
      console.error("Failed to restart challenge:", error);
    }
  };

  const isRunning = hasStarted && !ended && !showCompleted;

  return (
    <div className="container mx-auto max-w-4xl py-6">
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
      <Card>
        <CardHeader className="p-2 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="secondary" className="text-sm">
              {isMobile ? "Streak" : "Current streak"}: {problemsCorrect}
            </Badge>
            <TimerDisplay remainingTimeMs={remainingTimeMs} />
            <Badge variant="outline" className="text-sm">
              {isMobile ? "Best" : "Personal best"}:{" "}
              {data?.personalBest?.problemsCorrect ?? "??"}
            </Badge>
          </div>
        </CardHeader>

        <div className="relative">
          <BoardDisplay
            className={!isRunning ? "opacity-20" : ""}
            sgf={currentProblem?.sgf}
          />

          {isError && (
            <div className="absolute flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <Card className="w-full max-w-sm">
                <CardContent className="flex items-center gap-3 p-6 text-destructive">
                  <FileWarningIcon className="h-5 w-5" />
                  Failed to start challenge
                </CardContent>
                <CardContent className="text-muted-foreground text-sm">
                  Please refresh the page or click the button below to try
                  again.
                </CardContent>
                <CardFooter>
                  <Button onClick={refetch}>Try again</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Loading overlay - show while fetching initial data */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <Card className="w-full max-w-xs">
                <CardContent className="flex items-center gap-3 p-6">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {startLoading ||
                    (isFetching && (
                      <span className="text-sm text-muted-foreground">
                        Preparing your challenge…
                      </span>
                    ))}
                  {submitLoading && (
                    <span className="text-sm text-muted-foreground">
                      Submitting high scores…
                    </span>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Start button overlay - show after data loaded but before user starts */}
          {!hasStarted && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <Button
                size="lg"
                onClick={handleStart}
                className="gap-2 sm:text-lg bg-indigo-600 hover:bg-indigo-800 text-white"
              >
                <PlayCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                Game On
              </Button>
            </div>
          )}

          {/* Completed dialog overlay */}
          {showCompleted && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
              <ChallengeComplete
                onTryAgain={handleTryAgain}
                problemsCorrect={problemsCorrect}
                totalRunTimeMs={totalRunTimeMs}
                newPersonalBest={newPersonalBest}
                lastProblemSgf={currentProblem?.sgf}
              />
            </div>
          )}
        </div>

        {isRunning && (
          <ActionsDisplay
            onAnswer={answer}
            disabled={
              !hasStarted ||
              isSubmitting ||
              isFetching ||
              showCompleted ||
              ended
            }
          />
        )}
      </Card>
    </div>
  );
}
