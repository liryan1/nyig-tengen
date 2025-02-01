"use client";

import { validateProblemData } from "@/lib/go/goProblem";
import { ProblemResponse, StoneColor } from "@/lib/go/interface";
import { useSubmitMutation } from "@/lib/rtk/slices/problems";
import {
  CircleCheckBigIcon,
  MoveRightIcon,
  SendHorizonalIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { PageError } from "../../labels/Error";
import { PageSpinner } from "../../labels/Spinner";
import { Button } from "../../ui/button";
import { GoBoardStepper } from "./GoBoardStepper";
import { GoBoardView } from "./GoBoardView";
import { GoProblemHeader } from "./GoProblemHeader";
import { useGo } from "./useGo";
import { infoIcon, successIcon } from "@/components/labels/icons";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface GoProblemSubmitProps {
  problem: ProblemResponse;
  problemTitle?: string;
  problemSetProgressId?: string;
}

export function GoProblemSubmit({
  problem,
  problemSetProgressId,
}: GoProblemSubmitProps) {
  const { status: authStatus } = useSession();
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitEnabled, setSubmitEnabled] = useState(true);
  validateProblemData(problem);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [submit, { isLoading: sLoading, isError: sError }] =
    useSubmitMutation();
  const isLoading = sLoading || authStatus === "loading";
  const {
    goToMove,
    playMove,
    currentMove,
    boardHistory,
    cellSize,
    boardPixelSize,
  } = useGo({
    iBoardHistory: [problem.initial],
    maxCellSize: 50,
    boardContainerRef,
  });
  const [message, setMessage] = useState<React.ReactNode>("");

  const handlePlayMove = (row: number, col: number, color: StoneColor) => {
    setMessage("");
    playMove(row, col, color);
  };

  const handleGoToMove = (move: number) => {
    setMessage("");
    goToMove(move);
  };

  const handleSubmitAnswer = async () => {
    if (authStatus !== "authenticated") {
      setSubmitEnabled(false);
      toast.error("Please login to submit a solution");
      setTimeout(() => setSubmitEnabled(true), 3000);
      return;
    }
    const userMoves = boardHistory
      .slice(1, boardHistory.length)
      .map((h) => h.move as [number, number]);
    if (userMoves.length === 0) {
      setMessage("");
      return;
    } else if (!(userMoves.length & 1)) {
      setMessage(
        <div className="flex items-center gap-1">
          {infoIcon}
          Cannot end the sequence with the opponent&apos;s move.
        </div>,
      );
      return;
    }
    setMessage("");
    const { evaluation } = await submit({
      id: problem.id,
      userMoves,
      problemSetProgressId,
    }).unwrap();
    if (evaluation.status === "solved") {
      setShowSuccess(true);
      setSubmitEnabled(false);
      setTimeout(() => setShowSuccess(false), 3000);
      setMessage(
        <div className="flex items-center gap-1">
          {successIcon}
          Congratulations! You solved the problem
        </div>,
      );
    } else if (evaluation.status === "mismatch") {
      const oppMove = evaluation.correctOpponentMove;
      if (!oppMove) {
        setMessage(
          <>
            <div className="flex items-center gap-1">
              {infoIcon}
              Your move {evaluation.mismatchIndex + 1} seems off track
            </div>
            <Button
              variant="secondary"
              className="flex items-center gap-1"
              size="sm"
              onClick={() => goToMove(evaluation.mismatchIndex)}
            >
              Go to move {evaluation.mismatchIndex}
              <MoveRightIcon />
            </Button>
          </>,
        );
      } else {
        setMessage(
          <>
            <div className="flex items-center gap-1">
              {infoIcon}
              Opponent&apos;s move {evaluation.mismatchIndex + 1} seems off
              track
            </div>
            <Button
              variant="secondary"
              className="flex items-center gap-1"
              size="sm"
              onClick={() =>
                playMove(
                  oppMove[0],
                  oppMove[1],
                  boardHistory[0].color,
                  evaluation.mismatchIndex,
                )
              }
            >
              Check response
              <MoveRightIcon />
            </Button>
          </>,
        );
      }
    } else if (evaluation.status === "partial") {
      setMessage("Looks good so far, please continue the sequence.");
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-5 md:mt-4 gap-2 sm:gap-3 lg:gap-6">
      <div className="space-y-2 sm:space-y-6 lg:col-span-2">
        <GoProblemHeader meta={problem} initialColor={problem.initial.color} />
        <div className="relative p-2 sm:p-4 border rounded-md shadow-sm space-y-2 min-h-24 md:min-h-40 text-sm sm:text-base">
          {message}
          {isLoading && <PageSpinner />}
          {sError && (
            <PageError>
              Failed to submit solution. Please try again later.
            </PageError>
          )}
          <Button
            disabled={!submitEnabled}
            size="sm"
            onClick={handleSubmitAnswer}
            className="flex items-center gap-1 absolute right-0 bottom-0"
          >
            Submit
            <SendHorizonalIcon />
          </Button>
        </div>
      </div>
      <div
        ref={boardContainerRef}
        className="flex items-center lg:col-span-3 overflow-auto"
      >
        <div
          className="flex flex-col items-center space-y-2"
          style={{ width: `${boardPixelSize}px` }}
        >
          <GoBoardView
            icon={
              showSuccess && (
                <CircleCheckBigIcon
                  className="text-green-600"
                  size={cellSize * 2}
                />
              )
            }
            cellSize={cellSize}
            fullBoardHistory={boardHistory.slice(0, currentMove + 1)}
            onMove={handlePlayMove}
          />
          <GoBoardStepper
            onCurrentMoveChange={handleGoToMove}
            totalMoves={boardHistory.length - 1}
            currentMove={currentMove}
          />
        </div>
      </div>
    </div>
  );
}
