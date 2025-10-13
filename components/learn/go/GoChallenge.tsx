"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GoProblemBoard } from "./GoProblemBoard";
import { BoardState } from "@/lib/go/interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, Target } from "lucide-react";

interface ChallengeProblem {
  id: string;
  boardState: BoardState;
  correctAnswer: "Dead" | "Alive" | "Unfinished";
  difficulty: "Easy" | "Medium" | "Hard";
}

interface GoChallengeProps {
  onGameComplete: (
    score: number,
    correctAnswers: number,
    totalAnswers: number,
  ) => void;
}

export function GoChallenge({ onGameComplete }: GoChallengeProps) {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [currentProblem, setCurrentProblem] = useState<ChallengeProblem | null>(
    null,
  );
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRandomProblem = useCallback(async () => {
    try {
      const response = await fetch("/api/challenge/random");
      if (!response.ok) throw new Error("Failed to fetch problem");
      const problem = await response.json();
      setCurrentProblem(problem);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching problem:", error);
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(
    async (answer: "Dead" | "Alive" | "Unfinished") => {
      if (!currentProblem || gameOver) return;

      const isCorrect = answer === currentProblem.correctAnswer;
      const newTotalAnswers = totalAnswers + 1;
      const newCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);

      setTotalAnswers(newTotalAnswers);
      setCorrectAnswers(newCorrectAnswers);

      if (isCorrect) {
        setTimeRemaining((prev) => prev + 3);
        setScore((prev) => prev + 100);
        await fetchRandomProblem();
      } else {
        setGameOver(true);
        try {
          await fetch("/api/challenge/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "temp-session",
              finalScore: score,
              correctAnswers: newCorrectAnswers,
              totalAnswers: newTotalAnswers,
              timeSpent: 30 - timeRemaining,
            }),
          });
        } catch (error) {
          console.error("Error submitting results:", error);
        }
        onGameComplete(score, newCorrectAnswers, newTotalAnswers);
      }
    },
    [
      currentProblem,
      gameOver,
      totalAnswers,
      correctAnswers,
      score,
      timeRemaining,
      fetchRandomProblem,
      onGameComplete,
    ],
  );

  useEffect(() => {
    fetchRandomProblem();
  }, [fetchRandomProblem]);

  useEffect(() => {
    if (timeRemaining <= 0 && !gameOver) {
      setGameOver(true);
      onGameComplete(score, correctAnswers, totalAnswers);
      return;
    }

    if (!gameOver && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    timeRemaining,
    gameOver,
    onGameComplete,
    score,
    correctAnswers,
    totalAnswers,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span>Loading challenge...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameOver || timeRemaining <= 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Trophy className="h-6 w-6" />
              <span>Game Over!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">Score: {score}</div>
              <div className="text-lg">
                {correctAnswers}/{totalAnswers} correct (
                {totalAnswers > 0
                  ? Math.round((correctAnswers / totalAnswers) * 100)
                  : 0}
                %)
              </div>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full">
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">Failed to load challenge problem</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header with stats */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg">
                    {Math.floor(timeRemaining / 60)}:
                    {(timeRemaining % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span className="font-mono text-lg">{score}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span className="font-mono text-lg">
                    {correctAnswers}/{totalAnswers}
                  </span>
                </div>
              </div>
              <Progress value={(timeRemaining / 30) * 100} className="w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Main game area */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>What is the status of the marked stones?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {/* Go Board */}
            <div className="flex justify-center">
              <GoProblemBoard
                cellSize={24}
                boardSize={19}
                boardState={currentProblem.boardState}
                showSuccess={false}
              />
            </div>

            {/* Answer buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={() => submitAnswer("Dead")}
                variant="destructive"
                size="lg"
                className="min-w-24"
              >
                Dead
              </Button>
              <Button
                onClick={() => submitAnswer("Alive")}
                variant="default"
                size="lg"
                className="min-w-24"
              >
                Alive
              </Button>
              <Button
                onClick={() => submitAnswer("Unfinished")}
                variant="secondary"
                size="lg"
                className="min-w-24"
              >
                Unfinished
              </Button>
            </div>

            {/* Difficulty indicator */}
            <div className="text-sm text-muted-foreground">
              Difficulty: {currentProblem.difficulty}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
