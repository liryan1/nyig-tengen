"use client";

import { useCellSize } from "@/hooks/useCellSize";
import { getRank } from "@/lib/go/display";
import { GoProblemResponse } from "@/lib/go/interface";
import { getBoardSize, getRootBoardState } from "@/lib/go/parser";
import { formatLargeNumber } from "@/lib/utils";
import { CheckCircleIcon, EyeIcon, HeartIcon, SwordsIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Card, CardContent, CardFooter, CardTitle } from "../../ui/card";
import { ReadonlyGoBoard } from "../go/board/ReadonlyGoBoard";

type Props = {
  goProblemResponse: GoProblemResponse;
};

export function ProblemCard({ goProblemResponse }: Props) {
  const { id, initial, author, stats, rank } = goProblemResponse;
  const boardSize = getBoardSize(initial);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { cellSize, boardPixelSize } = useCellSize({
    boardContainerRef,
    boardSize,
  });

  const successRate =
    (stats?.correctCount ?? 0) / (stats?.submissionCount ?? 1);

  return (
    <Card className="hover:shadow-sm max-w-sm rounded-sm">
      <CardTitle className="font-medium text-sm md:text-base text-muted-foreground p-1">
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
        className="flex items-center justify-center p-0"
        ref={boardContainerRef}
      >
        <Link
          style={{ width: `${boardPixelSize}px` }}
          href={`/learn/problems/${id}`}
        >
          <ReadonlyGoBoard
            cellSize={cellSize}
            boardSize={boardSize}
            boardState={getRootBoardState(initial)}
          />
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground p-0 sm:px-1 py-1">
        <div className="flex gap-2">
          <span className="flex items-center space-x-1">
            <EyeIcon size={16} />
            <span>{stats?.views ? formatLargeNumber(stats.views) : "0"}</span>
          </span>
          <span className="flex items-center space-x-1">
            <HeartIcon size={16} />
            <span>{stats?.likes ? formatLargeNumber(stats.likes) : "0"}</span>
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircleIcon size={16} />
          <span>
            {(
              (!successRate || isNaN(successRate) ? 0 : successRate) * 100
            ).toFixed(1)}
            %
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
