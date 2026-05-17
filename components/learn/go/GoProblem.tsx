"use client";

import { CooldownButton } from "@/components/CooldownButton";
import { continueIcon, infoIcon, successIcon } from "@/components/labels/icons";
import { Spinner } from "@/components/labels/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/isMobile";
import { coordToIndices, getNextColor, GoGame } from "@/lib/go/goGame";
import { GoProblemResponse } from "@/lib/go/interface";
import { getBoardSize, toSgf } from "@/lib/go/parser";
import { setPsetCompletion } from "@/lib/rtk/psetCompletion";
import { useAppDispatch } from "@/lib/rtk/slices/hooks";
import { useSubmitMutation } from "@/lib/rtk/slices/problems";
import { UserRole } from "@prisma/client";
import {
  ArrowRightIcon,
  MoveRightIcon,
  PartyPopper,
  SendHorizonalIcon,
  XIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCellSize } from "../../../hooks/useCellSize";
import { useGo } from "../../../hooks/useGo";
import { getMoves } from "../../../lib/go/evaluate";
import { GoBoardMenu } from "./GoBoardMenu";
import { GoProblemAdminToolbar } from "./GoProblemAdminToolbar";
import { GoProblemBoard } from "./GoProblemBoard";
import { GoProblemHeader } from "./GoProblemHeader";
import { GoProblemToolbar } from "./GoProblemToolbar";
import { PassButton } from "./tools/PassButton";

const successTimeout = 3_000; // ms

interface GoProblemProps {
  problem: GoProblemResponse;
  problemSetProgressId?: string;
  initialSuccess?: boolean;
  noProgress?: boolean;
  problemSetInfo?: {
    name: string;
    total: number;
    solved: number;
    num: string;
  };
  nextProblemUrl?: string;
  currentProblemIndex?: number;
}

export function GoProblem({
  problem,
  problemSetProgressId,
  initialSuccess,
  noProgress,
  problemSetInfo,
  nextProblemUrl,
  currentProblemIndex,
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
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null,
  );
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) return;
    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown]);

  const handleMove = (...args: Parameters<typeof baseHandleMove>) => {
    if (redirectCountdown !== null) return;
    setShowSuccess(false);
    baseHandleMove(...args);
  };

  const handleSelectNode = (
    ...args: Parameters<typeof baseHandleSelectNode>
  ) => {
    if (redirectCountdown !== null) return;
    setShowSuccess(false);
    baseHandleSelectNode(...args);
  };

  const handleDeleteNode = (
    ...args: Parameters<typeof baseHandleDeleteNode>
  ) => {
    if (redirectCountdown !== null) return;
    setShowSuccess(false);
    baseHandleDeleteNode(...args);
  };

  const handleResetVariations = (
    ...args: Parameters<typeof baseHandleResetVariations>
  ) => {
    if (redirectCountdown !== null) return;
    setShowSuccess(false);
    baseHandleResetVariations(...args);
  };

  const handleCancelRedirect = () => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setRedirectCountdown(null);
  };

  const handleGoNow = () => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    if (!nextProblemUrl) {
      router.push(`/learn/sets/${problemSetInfo?.num}`);
    } else {
      router.push(nextProblemUrl);
    }
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

  const [submit, { data: sResult, isLoading: sLoading, isError: sError }] =
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
      if (problemSetProgressId) {
        if (problemSetCompleted) {
          dispatch(setPsetCompletion(problemSetNum));
        }
        setRedirectCountdown(3);
        if (redirectTimeoutRef.current)
          clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = setTimeout(() => {
          if (problemSetCompleted || !nextProblemUrl) {
            router.push(`/learn/sets/${problemSetNum || problemSetInfo?.num}`);
          } else {
            router.push(nextProblemUrl);
          }
        }, 3000);
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
      <GoProblemHeader
        num={problem.num}
        meta={problem}
        problemSetName={problemSetInfo?.name}
      />
      <hr />
      <div className="grid md:grid-cols-2">
        <div
          className="overflow-hidden relative"
          ref={boardContainerRef}
          style={{ height: viewHeight }}
          onClick={() => {
            if (redirectCountdown === null) setShowSuccess(false);
          }}
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
          {redirectCountdown !== null && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-center space-y-4">
              <PartyPopper className="w-12 h-12 text-yellow-500 animate-bounce" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  {!nextProblemUrl
                    ? "Problem Set Completed!"
                    : "Problem Solved!"}
                </h3>
                {problemSetInfo && (
                  <div className="text-muted-foreground text-sm">
                    <p className="font-medium text-foreground">
                      {problemSetInfo.name}
                    </p>
                    {currentProblemIndex !== undefined && (
                      <p>
                        {!nextProblemUrl
                          ? `Solved all ${problemSetInfo.total} problems`
                          : `Solved ${currentProblemIndex + 1} / ${
                              problemSetInfo.total
                            } problems`}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Redirecting in {redirectCountdown}s...
                </p>
              </div>
              <div className="flex gap-2">
                {nextProblemUrl && (
                  <Button
                    onClick={handleCancelRedirect}
                    variant="destructive"
                    size="sm"
                  >
                    Cancel
                  </Button>
                )}
                <Button onClick={handleGoNow} variant="outline" size="sm">
                  Go now
                  <ArrowRightIcon />
                </Button>
              </div>
            </div>
          )}
        </div>
        <div
          className="overflow-hidden flex flex-col"
          style={{ maxHeight: isMobile ? "30vh" : viewHeight }}
        >
          <div className="relative p-2 text-sm sm:text-base min-h-20 max-h-20 sm:min-h-24 sm:max-h-24 sm:space-y-2 overflow-hidden">
            {message}
            {noProgress && !sResult?.problemSetCompleted && (
              <div className="flex items-center gap-1 text-destructive font-medium">
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
            onClick={() => {
              if (redirectCountdown === null) setShowSuccess(false);
            }}
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
