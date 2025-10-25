"use client";

import { StatefulPagination } from "@/components/nav/StatefulPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { LeaderboardResponse } from "@/lib/rtk/slices/problemSets";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

type ProblemSetLeaderboardProps = {
  leaderboard?: LeaderboardResponse[];
  problemCount: number;
  className?: string;
};

export function ProblemSetLeaderboard({
  problemCount,
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
      .sort((a, b) => a._duration - b._duration)
      .map((r, i) => ({ ...r, rank: i + 1 }));
    return rows;
  }, [leaderboard]);

  const total = rowsWithRank.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const topCollapsed = rowsWithRank.slice(0, 3);
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
        <CardTitle>Leaderboard</CardTitle>
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
                  <LeaderboardRow
                    key={r.rank}
                    r={r}
                    maxScore={problemCount * 100}
                  />
                ))}
              </TableBody>
            </Table>

            {!expanded && total > 3 && (
              <p className="my-1 mr-1 text-xs text-muted-foreground text-right">
                Showing top 3 of {total}. Click “Show all” to view more.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

const formatDuration = (msInput: number) => {
  const totalSec = Math.floor(msInput / 1000);
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const totalH = Math.floor(totalMin / 60);
  const h = totalH % 24;
  const d = Math.floor(totalH / 24);
  const s = totalSec % 60;

  const parts: string[] = [];
  if (d > 0) parts.push(`${d} days`);
  if (h > 0) parts.push(`${h} hours`);
  if (m > 0) parts.push(`${m} mins`);
  if (parts.length === 0) parts.push(`${s} seconds`);

  return parts.join(" ");
};

const ordinal = (n: number) => {
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
}

function rankStyles(rank: number) {
  if (rank === 1)
    return "border-yellow-400 text-yellow-500 bg-yellow-500/10 ring-2 ring-yellow-300/40";
  if (rank === 2)
    return "border-zinc-300 text-zinc-500 bg-zinc-400/10 ring-2 ring-zinc-300/40";
  if (rank === 3)
    return "border-amber-400 text-amber-700 bg-amber-500/10 ring-2 ring-amber-400/40";
  return "border-transparent text-foreground/80 bg-muted/60";
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
    createdAt: string;
    completedAt: string;
    durationMs: string;
    score: number;
    completionCount: number;
  };
  maxScore: number;
}) {
  const percent = clamp(maxScore > 0 ? (r.score / maxScore) * 100 : 0, 0, 100);

  const name = r.user.name ?? "Player";

  return (
    <TableRow className="group hover:bg-muted/50 transition-colors">
      {/* Rank */}
      <TableCell className="w-12 text-center">
        <div
          className={cn(
            "mx-auto h-8 w-8 grid place-items-center rounded-full border text-sm font-semibold tabular-nums shadow-sm",
            rankStyles(r.rank),
          )}
          aria-label={`Rank ${r.rank}`}
        >
          {r.rank <= 3 ? (
            <Trophy className="h-4 w-4" aria-hidden="true" />
          ) : (
            r.rank
          )}
        </div>
        <span className="sr-only">Rank {r.rank}</span>
      </TableCell>

      {/* Player */}
      <TableCell>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{name}</span>
            <Badge
              variant="secondary"
              className="cursor-default h-5 rounded-full text-[12px] tracking-wide px-0.5"
              title={`${r.completionCount} completions`}
            >
              x{r.completionCount}
            </Badge>
          </div>

          <div className="text-xs">
            <span className="text-muted-foreground">
              Time: {formatDuration(r._duration)}
            </span>
            <Badge
              variant="secondary"
              className="hidden sm:inline cursor-default h-5 rounded-full px-2 text-[10px] tracking-wide"
              title={new Date(r.completedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            >
              updated {relativeTime(r.completedAt)}
            </Badge>
          </div>
        </div>
      </TableCell>

      {/* Score */}
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
              `${r.score === maxScore ? "[&>div]:bg-green-500" : undefined}`,
            )}
            aria-label={`Score ${Math.round(percent)}%`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
