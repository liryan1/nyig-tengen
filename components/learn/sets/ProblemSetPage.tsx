"use client";

import { getRank } from "@/lib/go/display";
import { getBoardSize, getRootBoardState } from "@/lib/go/parser";
import {
  useGetPSetProgressQuery,
  useGetPSetQuery,
} from "@/lib/rtk/slices/problemSets";
import { SubmissionStatus } from "@prisma/client";
import { CircleCheckBigIcon, CircleHelpIcon, TrophyIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { PageError } from "../../labels/Error";
import { PageSpinner } from "../../labels/Spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { GoBoardView } from "../go/board/GoBoardView";
import { InfoBar } from "../InfoBar";
import { StartButton } from "./StartButton";
import { ReadonlyGoBoard } from "../go/board/ReadonlyGoBoard";

export function ProblemSetPage({ sId }: { sId?: string }) {
  const { status: authStatus } = useSession();
  const {
    data: pset,
    isLoading: psetLoading,
    isError: psetError,
  } = useGetPSetQuery(sId ?? "", { skip: !sId });
  const {
    data: progress,
    isLoading: pgLoading,
    isError: pgError,
  } = useGetPSetProgressQuery(sId ?? "", {
    skip: !sId || authStatus !== "authenticated",
  });
  if (psetLoading || pgLoading) {
    return <PageSpinner />;
  }
  if (psetError || !pset) {
    return <PageError>Error getting problem set</PageError>;
  }
  if (pgError) {
    return <PageError>Error getting problem set progress</PageError>;
  }
  const {
    id,
    name,
    views,
    likes,
    description,
    problemCount,
    averageRank,
    completedCount,
    attemptedCount,
    author,
    problems,
  } = pset;

  const userSolved = progress?.completedCount;

  const getIcon = (status?: SubmissionStatus) => {
    if (status === "solved") {
      return <CircleCheckBigIcon className="text-green-600" size={40} />;
    }
    if (status === "mismatch" || status === "partial") {
      return <CircleHelpIcon size={40} strokeWidth={1.5} />;
    }
  };

  const handleProblemClick = (pId: string) => {
    if (!progress?.progress) {
      return;
    }
    return redirect(`/learn/sets/${id}/${pId}`);
  };

  return (
    <Card className="shadow-sm rounded-lg my-6">
      <CardHeader className="p-2 sm:p-4 border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-md sm:text-xl font-medium">{name}</span>
            {userSolved !== undefined && userSolved > 0 && (
              <div className="flex items-center text-muted-foreground">
                <TrophyIcon className="text-yellow-500" />
                <span className="text-md font-base">{userSolved}</span>
              </div>
            )}
          </div>
          <StartButton sId={sId} />
        </CardTitle>
        {description && (
          <CardDescription className="mt-2 text-xs sm:text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-2 sm:p-4 space-y-4">
        <InfoBar
          info={{
            author,
            rank: getRank(averageRank, true),
            count: problemCount,
            views,
            likes,
            rate: completedCount / attemptedCount,
          }}
        />
      </CardContent>
      <div className="text-sm text-muted-foreground px-2 sm:px-4">
        Total problems: <strong>{problemCount}</strong>
      </div>
      <CardFooter className="gap-2 sm:gap-4 p-2 sm:p-4 flex flex-wrap max-h-[1/2]">
        {problems.map((problem, i) => (
          <div
            className={progress?.progress ? "cursor-pointer" : ""}
            key={problem.id}
            onClick={() => handleProblemClick(problem.id)}
          >
            <ReadonlyGoBoard
              className="hover:shadow-lg"
              boardState={getRootBoardState(problem.initial)}
              boardSize={getBoardSize(problem.initial)}
              cellSize={20}
              icon={getIcon(progress?.progress?.problemOrder[i]?.status)}
            />
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}
