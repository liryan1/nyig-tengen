"use client";

import { PageError } from "@/components/labels/Error";
import { infoIcon, successIcon } from "@/components/labels/icons";
import { PageSpinner } from "@/components/labels/Spinner";
import { Button } from "@/components/ui/button";
import { coordToIndices } from "@/lib/go/goGame";
import { GoProblemResponse } from "@/lib/go/interface";
import { fromSgf, getBoardSize, toSgf } from "@/lib/go/parser";
import { useSubmitMutation } from "@/lib/rtk/slices/problems";
import { MoveRightIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useCellSize } from "../../../hooks/useCellSize";
import { getMoves } from "../../../lib/go/evaluate";
import { GoProblemBoard } from "./GoProblemBoard";
import { GoProblemHeader } from "./GoProblemHeader";
import { GoProblemToolbar } from "./GoProblemToolbar";
import { useGo } from "../../../hooks/useGo";
import { GoBoardStepper } from "./board/GoBoardStepper";
import { useIsMobile } from "@/hooks/isMobile";

interface GoProblemProps {
  problem: GoProblemResponse;
  problemSetProgressId?: string;
}

export function GoProblem({ problem, problemSetProgressId }: GoProblemProps) {
  const boardSize = getBoardSize(problem.initial);
  const root = fromSgf(problem.initial);
  const { handleMove, handleSelectNode, currentNode, nextPlayer, goLogic } =
    useGo({ boardSize, root });
  const isMobile = useIsMobile();
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<React.ReactNode>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { cellSize } = useCellSize({
    boardSize,
    boardContainerRef,
    minCellSize: isMobile ? 3 : 5,
    maxCellSize: isMobile ? 40 : 80,
  });
  const { status: authStatus } = useSession();

  const [submit, { isLoading: sLoading, isError: sError }] =
    useSubmitMutation();
  const isLoading = sLoading || authStatus === "loading";

  const handleSubmitAnswer = async () => {
    if (authStatus !== "authenticated") {
      toast.error("Please login to submit a solution");
      return;
    }
    const userMoves = getMoves(currentNode);
    if (userMoves.length === 0) {
      setMessage("Empty sequence");
      return;
    }
    setMessage("");
    const { evaluation } = await submit({
      id: problem.id,
      problemSetProgressId,
      userMoves,
    }).unwrap();
    if (evaluation.status === "solved") {
      setShowSuccess(true);
      // setTimeout(() => setShowSuccess(false), 10_000);
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
              onClick={() => {
                let userMovesLength = getMoves(currentNode).length;
                let node = currentNode;
                while (
                  userMovesLength > evaluation.mismatchIndex &&
                  node.parent
                ) {
                  userMovesLength--;
                  node = node.parent;
                }
                handleSelectNode(node);
              }}
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
              onClick={() => {
                let userMovesLength = getMoves(currentNode).length;
                let node = currentNode;
                while (
                  userMovesLength > evaluation.mismatchIndex &&
                  node.parent
                ) {
                  userMovesLength--;
                  node = node.parent;
                }
                const { row, col } = coordToIndices(oppMove);
                handleMove(row, col, node);
              }}
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
    <div className="sm:max-w-6xl mx-auto border rounded-md shadow-sm m-2">
      <GoProblemHeader meta={problem} />
      <hr />
      <div className="grid md:grid-cols-2">
        <div ref={boardContainerRef} className="overflow-none">
          <GoProblemBoard
            cellSize={cellSize}
            boardSize={boardSize}
            boardState={goLogic.getBoardState(currentNode, 1)}
            nextPlayer={nextPlayer}
            onMove={handleMove}
            showSuccess={showSuccess}
          />
        </div>
        <div
          className="flex flex-col flex-1 w-full overflow-auto"
          style={
            isMobile
              ? { maxHeight: boardContainerRef.current?.clientHeight || "auto" }
              : undefined // No maxHeight on larger screens
          }
        >
          <div className="relative p-2 text-sm sm:text-base min-h-20 sm:min-h-24">
            {message}
            {isLoading && <PageSpinner />}
            {sError && (
              <PageError>
                Failed to submit solution. Please try again later.
              </PageError>
            )}
          </div>
          <div className="sm:h-full h-32 md:min-h-40">
            <GoProblemToolbar
              rootNode={goLogic.root}
              currentNode={currentNode}
              onSelectNode={handleSelectNode}
              onSubmitAnswer={handleSubmitAnswer}
              getSgf={() => toSgf(goLogic.root, boardSize)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
