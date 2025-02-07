"use client";

import { getPixelSize, getRank } from "@/lib/go/display";
import { GoProblemResponse } from "@/lib/go/interface";
import { getBoardSize, getRootBoardState } from "@/lib/go/parser";
import { formatLargeNumber } from "@/lib/utils";
import { CheckCircleIcon, EyeIcon, SwordsIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Card, CardContent, CardFooter, CardTitle } from "../../ui/card";
import { useCellSize } from "@/hooks/useCellSize";
import { ReadonlyGoBoard } from "../go/board/ReadonlyGoBoard";

type Props = {
  goProblemResponse: GoProblemResponse;
};

export function ProblemCard({ goProblemResponse }: Props) {
  const { id, initial, author, stats, rank } = goProblemResponse;
  const boardSize = getBoardSize(initial);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { cellSize } = useCellSize({
    boardContainerRef,
    boardSize,
    maxCellSize: 40,
  });
  const { boardPixelSize } = getPixelSize({ boardSize, cellSize });

  const successRate =
    (stats?.correctCount ?? 0) / (stats?.submissionCount ?? 1);

  return (
    <Card className="hover:shadow-sm max-w-sm rounded-sm">
      <CardTitle className="font-medium text-muted-foreground p-2">
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
      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground p-0 px-2 py-1">
        <span className="flex items-center space-x-1">
          <EyeIcon size={16} />
          <span>{stats?.views ? formatLargeNumber(stats.views) : "?"}</span>
        </span>
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
