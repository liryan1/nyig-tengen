"use client";

import { StatefulPagination } from "@/components/nav/StatefulPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { LeaderboardResponse } from "@/lib/rtk/slices/problemSets";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  leaderboard?: LeaderboardResponse[];
  className?: string;
};

const formatDuration = (msInput: number) => {
  const ms = Math.max(0, Math.floor(msInput));
  const msR = ms % 1000;
  const totalSec = Math.floor(ms / 1000);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const totalH = Math.floor(totalMin / 60);
  const h = totalH % 24;
  const d = Math.floor(totalH / 24);

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const pad3 = (n: number) => String(n).padStart(3, "0");

  if (d > 0) return `${d}d ${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(msR)}`;
  if (totalH > 0) return `${h}:${pad2(m)}:${pad2(s)}.${pad3(msR)}`;
  return `${m}:${pad2(s)}.${pad3(msR)}`;
};

const fmtTime = (iso: string) => new Date(iso).toLocaleString();

const ordinal = (n: number) => {
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

function RankCell({ rank }: { rank: number }) {
  if (rank <= 3) {
    const color =
      rank === 1
        ? "text-yellow-500"
        : rank === 2
          ? "text-zinc-400"
          : "text-amber-700";
    return (
      <div className="flex items-center justify-center">
        <Trophy
          className={`h-6 w-6 ${color}`}
          aria-label={`${rank}${ordinal(rank)} place`}
        />
      </div>
    );
  }
  return (
    <span className="font-medium text-lg tabular-nums">
      {rank}
      <sup className="text-[10px] leading-none">{ordinal(rank)}</sup>
    </span>
  );
}

export function ProblemSetLeaderboard({ leaderboard, className }: Props) {
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b p-0 pl-2 sm:pl-4 md:pl-6 py-1">
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
                  <TableRow key={`${r.user.id}-${r.rank}`}>
                    <TableCell className="w-10 text-center">
                      <RankCell rank={r.rank} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {r.user.name ?? "Player"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Completed on {fmtTime(r.completedAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatDuration(r._duration)}
                    </TableCell>
                  </TableRow>
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
