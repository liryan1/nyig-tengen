"use client";

import { continueIcon, infoIcon, successIcon } from "@/components/labels/icons";
import { Spinner } from "@/components/labels/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/isMobile";
import { coordToIndices, getNextColor, GoGame } from "@/lib/go/goGame";
import { GoProblemResponse } from "@/lib/go/interface";
import { getBoardSize, toSgf } from "@/lib/go/parser";
import { makeCutoffSquare } from "@/lib/go/display";
import { useAppDispatch } from "@/lib/rtk/slices/hooks";
import { useSubmitMutation } from "@/lib/rtk/slices/problems";
import { setPsetCompletion } from "@/lib/rtk/psetCompletion";
import { MoveRightIcon, SendHorizonalIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCellSize } from "../../../hooks/useCellSize";
import { useGo } from "../../../hooks/useGo";
import { getMoves } from "../../../lib/go/evaluate";
import { GoBoardMenu } from "./GoBoardMenu";
import { GoProblemBoard } from "./GoProblemBoard";
import { GoProblemHeader } from "./GoProblemHeader";
import { GoProblemToolbar } from "./GoProblemToolbar";
import { PassButton } from "./tools/PassButton";
import { GoProblemAdminToolbar } from "./GoProblemAdminToolbar";
import { UserRole } from "@prisma/client";
import { CooldownButton } from "@/components/CooldownButton";
import { useRouter } from "next/navigation";

const successTimeout = 3_000; // ms

interface GoProblemProps {
  problem: GoProblemResponse;
  problemSetProgressId?: string;
  initialSuccess?: boolean;
  noProgress?: boolean;
}

export function GoProblem({
  problem,
  problemSetProgressId,
  initialSuccess,
  noProgress,
}: GoProblemProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const boardSize = getBoardSize(problem.initial);
  const goGameRef = useRef<GoGame | null>(null);
  if (goGameRef.current === null) {
    goGameRef.current = GoGame.fromSgf(problem.initial);
  }
  const goGame = goGameRef.current;
  const {
    handleMove: baseHandleMove,
    handleSelectNode: baseHandleSelectNode,
    handleDeleteNode: baseHandleDeleteNode,
    handleResetVariations: baseHandleResetVariations,
    currentNode,
    nextPlayer,
  } = useGo({
    goGame,
  });

  const [showSuccess, setShowSuccess] = useState(!!initialSuccess);

  const handleMove = (...args: Parameters<typeof baseHandleMove>) => {
    setShowSuccess(false);
    baseHandleMove(...args);
  };

  const handleSelectNode = (
    ...args: Parameters<typeof baseHandleSelectNode>
  ) => {
    setShowSuccess(false);
    baseHandleSelectNode(...args);
  };

  const handleDeleteNode = (
    ...args: Parameters<typeof baseHandleDeleteNode>
  ) => {
    setShowSuccess(false);
    baseHandleDeleteNode(...args);
  };

  const handleResetVariations = (
    ...args: Parameters<typeof baseHandleResetVariations>
  ) => {
    setShowSuccess(false);
    baseHandleResetVariations(...args);
  };

  const hasInitialized = useRef(false);
  if (
    !hasInitialized.current &&
    initialSuccess &&
    problem.userMoves &&
    problem.userMoves.length > 0
  ) {
    hasInitialized.current = true;
    let node = goGame.root;
    for (const move of problem.userMoves) {
      try {
        const color =
          node === goGame.root
            ? 1
            : node.moveColor
              ? getNextColor(node.moveColor)
              : 1;
        if (!move) {
          node = goGame.playPass(node, color);
        } else {
          node = goGame.playMove(node, color, move);
        }
      } catch (e) {
        console.error("Failed to replay move", move, e);
      }
    }
    baseHandleSelectNode(node);
  }

  const isMobile = useIsMobile();
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<React.ReactNode>("");
  const { cellSize, boardPixelSize } = useCellSize({
    boardSize,
    boardContainerRef,
    cutoff: problem.cutoff,
  });

  const viewHeight = boardPixelSize;

  const { data: session, status: authStatus } = useSession();
  const userOwnsProblem = session?.user?.id === problem.author.id;
  const isUserSuperAdmin = session?.user?.role === UserRole.SUPERADMIN;
  const endorsedNotByUser =
    problem.endorser && problem.endorser.id !== session?.user?.id;

  const [submit, { isLoading: sLoading, isError: sError }] =
    useSubmitMutation();
  const isLoading = sLoading || authStatus === "loading";

  const handleSubmitAnswer = async () => {
    if (noProgress) return;
    if (authStatus !== "authenticated") {
      toast("Please sign in to submit a solution", {
        action: {
          label: "Sign in",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }
    const userMoves = getMoves(currentNode);
    if (userMoves.length === 0) {
      setMessage("Empty sequence");
      return;
    }
    setMessage("");
    const { evaluation, problemSetCompleted, problemSetNum } = await submit({
      num: problem.num,
      problemSetProgressId,
      userMoves,
    }).unwrap();
    if (evaluation.status === "solved") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), successTimeout);
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
      if (problemSetProgressId && problemSetCompleted) {
        dispatch(setPsetCompletion(problemSetNum));
      }
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
      setMessage(
        <div className="flex items-center gap-1">
          {continueIcon}
          Looks good so far, please continue the sequence.
        </div>,
      );
    }
  };

  return (
    <div className="border rounded-md shadow-sm">
      {!problemSetProgressId && (userOwnsProblem || isUserSuperAdmin) && (
        <>
          <GoProblemAdminToolbar
            isSuperAdmin={isUserSuperAdmin}
            userOwnsProblem={userOwnsProblem}
            problemNum={problem.num}
            isEndorsed={!!problem.endorser}
            endorsedNotByUser={endorsedNotByUser}
          />
          <hr />
        </>
      )}
      <GoProblemHeader num={problem.num} meta={problem} />
      <hr />
      <div className="grid md:grid-cols-2">
        <div
          className="overflow-hidden"
          ref={boardContainerRef}
          style={{ height: viewHeight }}
          onClick={() => setShowSuccess(false)}
        >
          <GoProblemBoard
            cellSize={cellSize}
            boardSize={boardSize}
            boardState={goGame.getBoardState(currentNode, 1)}
            nextPlayer={nextPlayer}
            onMove={handleMove}
            showSuccess={showSuccess}
            cutoff={problem.cutoff}
          />
        </div>
        <div
          className="overflow-hidden flex flex-col"
          style={{ maxHeight: isMobile ? "30vh" : viewHeight }}
        >
          <div className="relative p-2 text-sm sm:text-base min-h-20 max-h-20 sm:min-h-24 sm:max-h-24 sm:space-y-2 overflow-hidden">
            {message}
            {noProgress && (
              <div className="flex items-center gap-1 text-orange-500 font-medium">
                {infoIcon}
                Not attempting. Progress will not be saved.
              </div>
            )}
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
            <GoBoardMenu
              className="hidden sm:flex absolute right-1 bottom-1 aspect-square gap-0"
              handleExportSgf={() => toSgf(goGame.root, boardSize)}
              onResetVariations={handleResetVariations}
            />
            <PassButton
              className="sm:hidden absolute top-1 right-1"
              onClick={() => handleMove(-1, -1)}
            />
            <CooldownButton
              className="sm:hidden absolute bottom-1 right-1"
              throttleMs={5_000}
              text="Submit"
              icon={
                isLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <SendHorizonalIcon />
                )
              }
              size="sm"
              onClick={handleSubmitAnswer}
              disabled={isLoading || noProgress}
            />
          </div>
          <div
            className="flex-1 overflow-hidden"
            onClick={() => setShowSuccess(false)}
          >
            <GoProblemToolbar
              rootNode={goGame.root}
              currentNode={currentNode}
              onSelectNode={handleSelectNode}
              onDeleteNode={handleDeleteNode}
            >
              <GoBoardMenu
                className="aspect-square sm:hidden ml-1"
                handleExportSgf={() => toSgf(goGame.root, boardSize)}
                onResetVariations={handleResetVariations}
              />
              <div className="hidden sm:flex items-end gap-1">
                <PassButton onClick={() => handleMove(-1, -1)} />
              </div>
              <div className="hidden sm:flex items-end gap-2">
                <CooldownButton
                  throttleMs={5_000}
                  text="Submit"
                  icon={
                    isLoading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <SendHorizonalIcon />
                    )
                  }
                  size="sm"
                  onClick={handleSubmitAnswer}
                  disabled={isLoading || noProgress}
                />
              </div>
            </GoProblemToolbar>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoProblem;
