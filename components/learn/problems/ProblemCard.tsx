"use client";

import { getRank } from "@/lib/go/goLogic";
import { GetProblemProblemResponse } from "@/lib/rtk/slices/problems";
import { formatLargeNumber } from "@/lib/utils";
import { CheckCircleIcon, EyeIcon, SwordsIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Card, CardContent, CardFooter, CardTitle } from "../../ui/card";
import { GoBoardView } from "../go/GoBoardView";
import { useGo } from "../go/useGo";

type Props = {
  getproblemProblemResponse: GetProblemProblemResponse;
};

export function ProblemCard({ getproblemProblemResponse }: Props) {
  const { id, initial, author, problemStats, rank } = getproblemProblemResponse;
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { cellSize, boardPixelSize } = useGo({
    iBoardHistory: [initial],
    maxCellSize: 40,
    boardContainerRef,
  });

  return (
    <Card className="hover:shadow-xl max-w-sm rounded-sm">
      <CardTitle className="font-medium text-muted-foreground px-2 py-1">
        <div className="flex justify-between">
          <span>
            <Link className="underline" href="#">
              {author.name}
            </Link>
          </span>
          <span className="flex items-center space-x-1">
            <SwordsIcon size={16} />
            <span>{getRank(rank)}</span>
          </span>
        </div>
      </CardTitle>
      <CardContent
        ref={boardContainerRef}
        className="flex items-center justify-center p-2"
      >
        <Link
          style={{ width: `${boardPixelSize}px` }}
          href={`/learn/problems/${id}`}
        >
          <GoBoardView
            readonly
            cellSize={cellSize}
            fullBoardHistory={[initial]}
          />
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground p-0 px-2 py-1">
        <span className="flex items-center space-x-1">
          <EyeIcon size={16} />
          <span>
            {problemStats?.views ? formatLargeNumber(problemStats.views) : "?"}
          </span>
        </span>
        <div className="flex items-center space-x-1">
          <CheckCircleIcon size={16} />
          <span>
            {(
              ((problemStats?.correctCount ?? 0) /
                (problemStats?.submissionCount ?? 1)) *
              100
            ).toFixed(2)}
            %
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
