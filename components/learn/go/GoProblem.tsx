"use client";

import { infoIcon, successIcon } from "@/components/labels/icons";
import { PageSpinner, Spinner } from "@/components/labels/Spinner";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/isMobile";
import { coordToIndices, GoGame } from "@/lib/go/goGame";
import { GoProblemResponse } from "@/lib/go/interface";
import { getBoardSize, toSgf } from "@/lib/go/parser";
import { useSubmitMutation } from "@/lib/rtk/slices/problems";
import { MoveRightIcon, SendHorizonalIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCellSize } from "../../../hooks/useCellSize";
import { useGo } from "../../../hooks/useGo";
import { getMoves } from "../../../lib/go/evaluate";
import { GoProblemBoard } from "./GoProblemBoard";
import { GoProblemHeader } from "./GoProblemHeader";
import { GoProblemToolbar } from "./GoProblemToolbar";
import { ExportSGFButton } from "./tools/ExportSGFButton";
import { PassButton } from "./tools/PassButton";
import { Skeleton } from "@/components/ui/skeleton";

interface GoProblemProps {
  problem: GoProblemResponse;
  problemSetProgressId?: string;
  initialSuccess?: boolean;
}

export function GoProblem({
  problem,
  problemSetProgressId,
  initialSuccess,
}: GoProblemProps) {
  const boardSize = getBoardSize(problem.initial);
  const goGameRef = useRef<GoGame | null>(null);
  if (goGameRef.current === null) {
    goGameRef.current = GoGame.fromSgf(problem.initial);
  }
  const goGame = goGameRef.current;
  const {
    handleMove,
    handleSelectNode,
    handleDeleteNode,
    currentNode,
    nextPlayer,
  } = useGo({
    goGame,
  });
  const isMobile = useIsMobile();
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<React.ReactNode>("");
  const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
  const { cellSize, boardPixelSize } = useCellSize({
    boardSize,
    boardContainerRef,
  });
  const { status: authStatus } = useSession();

  const [submit, { isLoading: sLoading, isError: sError }] =
    useSubmitMutation();
  const isLoading = sLoading || authStatus === "loading";

  const handleSubmitAnswer = async () => {
    if (authStatus !== "authenticated") {
      toast.error("Please login to submit a solution.");
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
      setTimeout(() => setShowSuccess(false), 8_000);
      setMessage(
        <>
          <div className="flex items-center gap-1">
            {successIcon}
            Congratulations! You solved the problem.
          </div>
          {evaluation.mismatchIndex ? (
            <div className="text-muted-foreground text-sm">
              Checked up to move {evaluation.mismatchIndex}
            </div>
          ) : undefined}
        </>,
      );
    } else if (evaluation.status === "mismatch") {
      const oppMove = evaluation.correctOpponentMove;
      const i = evaluation.mismatchIndex;
      if (!oppMove) {
        setMessage(
          <>
            <div className="flex items-center gap-1">
              {infoIcon}
              Your move {i + 1} seems off track
            </div>
            <Button
              variant="secondary"
              className="flex items-center gap-1"
              size="sm"
              onClick={() => {
                let userMovesLength = getMoves(currentNode).length;
                let node = currentNode;
                while (userMovesLength > i && node.parent) {
                  userMovesLength--;
                  node = node.parent;
                }
                handleSelectNode(node);
              }}
            >
              Go to
              {i === 0 ? " the beginning" : ` move ${i}`}
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
    <div className="sm:max-w-6xl mx-auto border rounded-md shadow-sm m-2 px-1 sm:px-0">
      <GoProblemHeader pId={problem.id} meta={problem} />
      <hr />
      <div className="grid md:grid-cols-2">
        <div
          className="overflow-hidden"
          ref={boardContainerRef}
          style={{ height: boardPixelSize }}
        >
          <GoProblemBoard
            cellSize={cellSize}
            boardSize={boardSize}
            boardState={goGame.getBoardState(currentNode, 1)}
            nextPlayer={nextPlayer}
            onMove={handleMove}
            showSuccess={showSuccess}
          />
        </div>
        <div
          className="overflow-hidden"
          style={{ maxHeight: isMobile ? "30vh" : boardPixelSize }}
        >
          <div className="relative p-2 text-sm sm:text-base min-h-20 max-h-20 sm:min-h-24 sm:max-h-24 sm:space-y-2 overflow-hidden">
            {message}
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[180px]" />
              </div>
            )}
            {sError && (
              <div className="flex justify-center items-center p-10 text-xl text-red-500">
                Failed to submit solution. Please try again later.
              </div>
            )}
          </div>
          <GoProblemToolbar
            rootNode={goGame.root}
            currentNode={currentNode}
            onSelectNode={handleSelectNode}
            onDeleteNode={handleDeleteNode}
          >
            <div className="flex items-end gap-1">
              <PassButton onClick={() => handleMove(-1, -1)} />
            </div>
            <div className="flex items-end gap-2">
              <ExportSGFButton
                getSgfString={() => toSgf(goGame.root, boardSize)}
              />
              <Button
                size="sm"
                onClick={handleSubmitAnswer}
                disabled={isLoading}
              >
                Submit
                {isLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <SendHorizonalIcon />
                )}
              </Button>
            </div>
          </GoProblemToolbar>
        </div>
      </div>
    </div>
  );
}

export default GoProblem;
