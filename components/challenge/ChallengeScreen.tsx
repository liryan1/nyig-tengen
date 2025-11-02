"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useChallenge } from "@/hooks/useChallenge";
import {
  useChallengeSubmitMutation,
  useStartChallengeQuery,
} from "@/lib/rtk/slices/challenge";
import { FileWarningIcon, Loader2, PlayCircle } from "lucide-react";
import { useState } from "react";
import { PageError } from "../labels/Error";
import { ActionsDisplay } from "./display/ActionsDisplay";
import { BoardDisplay } from "./display/BoardDisplay";
import { ChallengeComplete } from "./display/ChallengeComplete";
import { TimerDisplay } from "./display/TimeDisplay";
import { useIsMobile } from "@/hooks/isMobile";

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

  const handleChallengeEnded = async () => {
    const attemptId = data?.attemptId;
    if (!attemptId) {
      console.error("Unable to find attempt to update");
      return;
    }
    if (problemsCorrect >= 1) {
      const newPersonalBest = await submit({
        attemptId,
        timeSpentMs: totalRunTimeMs,
        score: problemsCorrect,
      }).unwrap();
      setNewPersonalBest(newPersonalBest.problemsCorrect);
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
      <Card className="">
        <CardHeader className="p-4 sm:p-6">
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
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
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
