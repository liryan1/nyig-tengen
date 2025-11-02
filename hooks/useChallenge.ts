"use client";

import { CORRECT_BONUS_MS, START_TIME_MS } from "@/lib/challenge";
import { ChallengeAnswer } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTimer } from "./useTimer";
import { StartChallengeResponse } from "@/lib/rtk/slices/challenge";

interface UseChallengeProps {
  startChallengeResponse?: StartChallengeResponse;
  onChallengeEnded?: () => void;
}

export function useChallenge({
  startChallengeResponse,
  onChallengeEnded,
}: UseChallengeProps) {
  const problems = startChallengeResponse?.problems ?? [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ended, setEnded] = useState(false);
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const timer = useTimer({
    initialMs: START_TIME_MS,
    onEnd: () => setEnded(true),
    autoStart: false,
  });

  useEffect(() => {
    try {
      setIsSubmitting(true);
      if (ended) {
        onChallengeEnded && onChallengeEnded();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [ended, isSubmitting]);

  const start = useCallback(() => {
    timer.start();
  }, [timer]);

  const handleEnd = useCallback(() => {
    timer.pause();
    setEnded(true);
  }, [timer]);

  const nextProblem = useCallback(() => {
    if (currentProblemIdx === problems.length - 1) {
      handleEnd();
    }
    setCurrentProblemIdx((prev) => prev + 1);
  }, [currentProblemIdx, problems.length, handleEnd]);

  // Compares answer to the answer of the current problem, if wrong, end the challenge
  // If correct, add bonus time, add current problem to completed problems, and
  // change current problem to a radomly selected new problem from data.problems.
  // If all problems are completed, end the challenge.
  const answer = useCallback(
    (ans: ChallengeAnswer) => {
      const problem = problems[currentProblemIdx];

      if (!problem || currentProblemIdx >= problems.length || ended) {
        return;
      }

      if (ans !== problem.correctAnswer) {
        handleEnd();
        return;
      }

      timer.addMs(CORRECT_BONUS_MS);
      nextProblem();
    },
    [problems, currentProblemIdx, ended, handleEnd, timer, nextProblem],
  );

  const reset = useCallback(() => {
    setEnded(false);
    setCurrentProblemIdx(0);
    timer.reset();
  }, [timer]);

  const currentProblem = useMemo(
    () => problems.at(currentProblemIdx),
    [problems, currentProblemIdx],
  );

  return useMemo(
    () => ({
      currentProblem: currentProblem,
      remainingTimeMs: timer.ms,
      totalRunTimeMs: timer.totalRunTimeMs,
      problemsCorrect: currentProblemIdx,
      isSubmitting,
      ended,
      answer,
      reset,
      start,
    }),
    [
      problems,
      currentProblem,
      timer.ms,
      timer.totalRunTimeMs,
      currentProblemIdx,
      isSubmitting,
      ended,
      answer,
      reset,
      start,
    ],
  );
}
