"use client";

import { useCellSize } from "@/hooks/useCellSize";
import { LIKED_COLOR, STAR_COLOR } from "@/lib/color";
import { getRank } from "@/lib/go/display";
import { GoProblemResponse } from "@/lib/go/interface";
import { getBoardSize, getRootBoardState } from "@/lib/go/parser";
import { formatLargeNumber, truncateString } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { EyeIcon, HeartIcon, StarIcon, SwordsIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { PiCrownSimple } from "react-icons/pi";
import { Card, CardContent, CardFooter, CardTitle } from "../../ui/card";
import { ReadonlyGoBoard } from "../go/board/ReadonlyGoBoard";
import { EndorsedTooltip } from "./EndorsedTooltip";
import { SuccessRate } from "./SuccessRate";

type Props = {
  goProblemResponse: GoProblemResponse;
};

export function ProblemCard({ goProblemResponse }: Props) {
  const { num, initial, author, stats, rank, userSolved, endorser } =
    goProblemResponse;
  const boardSize = getBoardSize(initial);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { cellSize, boardPixelSize } = useCellSize({
    boardContainerRef,
    boardSize,
    cutoff: goProblemResponse.cutoff,
  });

  const successRate =
    (stats?.correctCount ?? 0) / (stats?.submissionCount ?? 1);

  const isAuthorAdmin = author.role === UserRole.ADMIN || UserRole.SUPERADMIN;

  return (
    <Card className="hover:shadow-sm max-w-sm rounded-sm">
      <CardTitle className="font-medium text-sm text-muted-foreground p-1">
        <div className="flex justify-between">
          <Link href="#" className="flex items-center gap-0.5">
            {truncateString(author.name, 15)}
            {isAuthorAdmin && <PiCrownSimple size={16} />}
          </Link>
          <div className="flex items-center gap-0.5">
            {endorser && (
              <EndorsedTooltip
                size={20}
                endorserName={`${endorser.name}${endorser.rank ? " " + endorser.rank : ""}`}
              />
            )}
            <span className="flex items-center gap-0.5 select-none">
              <SwordsIcon size={16} />
              {getRank(rank)}
            </span>
          </div>
        </div>
      </CardTitle>
      <CardContent
        className="flex items-center justify-center !p-0"
        ref={boardContainerRef}
      >
        <Link
          style={{ width: `${boardPixelSize}px` }}
          href={`/learn/problems/${num}`}
        >
          <ReadonlyGoBoard
            cellSize={cellSize}
            sgf={initial}
            cutoff={goProblemResponse.cutoff}
          />
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground !p-0 !sm:px-1 !py-1 select-none">
        <div className="flex gap-1">
          <span className="flex items-center gap-0.5">
            <EyeIcon size={16} />
            <span>{stats?.views ? formatLargeNumber(stats.views) : "0"}</span>
          </span>
          <span className="flex items-center gap-0.5">
            <HeartIcon
              size={16}
              fill={stats?.userLiked ? LIKED_COLOR : "none"}
            />
            <span>{stats?.likes ? formatLargeNumber(stats.likes) : "0"}</span>
          </span>
          <span className="flex items-center gap-0.5">
            <StarIcon
              size={16}
              fill={stats?.userStarred ? STAR_COLOR : "none"}
            />
          </span>
        </div>
        <SuccessRate
          successRate={successRate}
          userSolved={userSolved}
          convertToPercent
        />
      </CardFooter>
    </Card>
  );
}

export default ProblemCard;
