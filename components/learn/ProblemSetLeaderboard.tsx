"use client";

import { StatefulPagination } from "@/components/nav/StatefulPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LeaderboardResponse } from "@/lib/rtk/slices/problemSets";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, InfoIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { LeaderboardTableRow } from "../LeaderboardTableRow";

const DEFAULT_ROWS_SHOWN = 5;

type ProblemSetLeaderboardProps = {
  leaderboard?: LeaderboardResponse[];
  maxScore: number;
  className?: string;
};

export function ProblemSetLeaderboard({
  maxScore,
  leaderboard,
  className,
}: ProblemSetLeaderboardProps) {
  const pageSize = 10;
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);

  const rowsWithRank = useMemo(() => {
    const rows = (leaderboard ?? [])
      .map((r) => ({
        ...r,
        _duration: Number(r.durationMs) || 0,
      }))
      .map((r, i) => ({ ...r, rank: i + 1 }));
    return rows;
  }, [leaderboard]);

  const total = rowsWithRank.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const topCollapsed = rowsWithRank.slice(0, DEFAULT_ROWS_SHOWN);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = rowsWithRank.slice(pageStart, pageStart + pageSize);
  const visibleRows = expanded ? pageRows : topCollapsed;

  const onToggle = () => {
    setExpanded((v) => {
      const next = !v;
      if (next) setPage(1);
      return next;
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b p-0 pl-2 md:pl-4 py-1">
        <CardTitle className="flex items-center gap-1 ">
          <span>High scores</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Maximum score: {maxScore}</p>
                <p className="text-sm">
                  Each problem is worth 100 points. Incorrect attempts deduct 25
                  points (max 50 deduction per problem).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <div className="flex items-center gap-2">
          {expanded && totalPages > 1 && (
            <StatefulPagination
              currentPage={safePage}
              onPageChange={setPage}
              totalPages={totalPages}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-expanded={expanded}
            className="gap-1"
          >
            {expanded ? (
              <>
                Collapse <ChevronUp className="h-5 w-5" />
              </>
            ) : (
              <>
                Show all <ChevronDown className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 border-b">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center my-1">
            No completions yet.
          </p>
        ) : (
          <>
            <Table className="border-b">
              <TableBody>
                {visibleRows.map((r) => (
                  <LeaderboardRow key={r.rank} r={r} maxScore={maxScore} />
                ))}
              </TableBody>
            </Table>

            {!expanded && total > DEFAULT_ROWS_SHOWN && (
              <p className="my-1 mr-1 text-xs text-muted-foreground text-right">
                Showing top {DEFAULT_ROWS_SHOWN} of {total}. Click “Show all” to
                view more.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function scoreColor(score: number, maxScore: number) {
  if (score >= maxScore * 0.9) {
    return "[&>div]:bg-green-500";
  } else if (score >= maxScore * 0.8) {
    return "[&>div]:bg-yellow-500";
  }
  return undefined;
}

function LeaderboardRow({
  r,
  maxScore,
}: {
  r: {
    rank: number;
    _duration: number;
    user: {
      id: string;
      name: string;
    };
    completedAt: string;
    durationMs: string;
    score: number;
    completionCount: number;
  };
  maxScore: number;
}) {
  const percent = clamp(maxScore > 0 ? (r.score / maxScore) * 100 : 0, 0, 100);

  return (
    <LeaderboardTableRow
      rank={r.rank}
      user={r.user}
      completedAt={r.completedAt}
      durationMs={r._duration}
      completionCount={r.completionCount}
    >
      <TableCell className="w-30 sm:w-40 text-right align-middle">
        <div className="flex flex-col items-end gap-1">
          <div className="text-sm tabular-nums">
            <span className="font-bold">{r.score.toLocaleString()} </span>
            <span className="text-muted-foreground text-xs">
              /{maxScore.toLocaleString()}
            </span>
          </div>
          <Progress
            value={percent}
            className={cn(
              "h-1 sm:h-1.5 w-20 sm:w-28",
              scoreColor(r.score, maxScore),
            )}
            aria-label={`Score ${Math.round(percent)}%`}
          />
        </div>
      </TableCell>
    </LeaderboardTableRow>
  );
}
