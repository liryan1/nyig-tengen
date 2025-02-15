"use client";

import { PageError } from "@/components/labels/Error";
import { infoIcon, successIcon } from "@/components/labels/icons";
import { PageSpinner } from "@/components/labels/Spinner";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/isMobile";
import { coordToIndices, GoGame } from "@/lib/go/goGame";
import { GoProblemResponse } from "@/lib/go/interface";
import { getBoardSize, toSgf } from "@/lib/go/parser";
import { useSubmitMutation } from "@/lib/rtk/slices/problems";
import { MoveRightIcon, SendHorizonalIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useCellSize } from "../../../hooks/useCellSize";
import { useGo } from "../../../hooks/useGo";
import { getMoves } from "../../../lib/go/evaluate";
import { GoProblemBoard } from "./GoProblemBoard";
import { GoProblemHeader } from "./GoProblemHeader";
import { GoProblemToolbar } from "./GoProblemToolbar";
import { ExportSGFButton } from "./node/ExportSGFButton";

const sgf = `
(;SZ[19](;SZ[19];AB[bl][bn][cn][co][dp][dq][dr][fr]AW[bo][ap][cp][cq][cr]SZ[19](;B[pj];W[oj];B[ok];W[nj];B[nk])(;B[nl];W[nk];B[mk])(;B[ml](;W[nk];B[mm];W[nm])(;W[on];B[mo];W[nq])(;W[lq](;B[pq])(;B[jj];W[mf])(;B[ia];W[jg])(;B[ke];W[od])(;B[pd];W[rn])(;B[ss];W[rs])(;B[no](;W[np])(;W[gk])(;W[he])(;W[lc])(;W[ob])(;W[qb])(;W[bc]))(;B[ba])(;B[rs]))(;W[gb])(;W[na]))))
`;

interface GoProblemProps {
  problem: GoProblemResponse;
  problemSetProgressId?: string;
}

export function GoProblem({ problem, problemSetProgressId }: GoProblemProps) {
  const boardSize = getBoardSize(problem.initial);
  const goGameRef = useRef<GoGame | null>(null);
  if (goGameRef.current === null) {
    goGameRef.current = GoGame.fromSgf(sgf); //problem.initial);
  }
  const goGame = goGameRef.current;
  const { handleMove, handleSelectNode, currentNode, nextPlayer } = useGo({
    goGame,
  });
  const isMobile = useIsMobile();
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<React.ReactNode>("");
  const [showSuccess, setShowSuccess] = useState(false);
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
      <div
        className="grid md:grid-cols-2"
        style={{ maxHeight: boardPixelSize }}
      >
        <div
          ref={boardContainerRef}
          className="overflow-none"
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
          <div className="relative p-2 text-sm sm:text-base min-h-20 sm:min-h-24">
            {message}
            {isLoading && <PageSpinner />}
            {sError && (
              <PageError>
                Failed to submit solution. Please try again later.
              </PageError>
            )}
          </div>
          {/* <div className=""> */}
          <GoProblemToolbar
            rootNode={goGame.root}
            currentNode={currentNode}
            onSelectNode={handleSelectNode}
          >
            <ExportSGFButton
              className="sticky left-0 sm:left-1 bottom-0 sm:bottom-1"
              getSgfString={() => toSgf(goGame.root, boardSize)}
            />
            <Button
              size="sm"
              onClick={handleSubmitAnswer}
              className="sticky right-0 sm:right-1 bottom-0 sm:bottom-1"
            >
              Submit
              <SendHorizonalIcon />
            </Button>
          </GoProblemToolbar>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
