import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  cn,
  truncateString,
  clamp,
  ordinal,
  formatDuration,
  formatRelativeTime,
} from "@/lib/utils";
import { Trophy } from "lucide-react";

export function LeaderboardTableRow({
  rank,
  user,
  completedAt,
  durationMs,
  completionCount,
  children,
  hideTime,
}: {
  rank: number;
  user: {
    id: string;
    name: string;
  };
  completedAt: string;
  durationMs: number;
  completionCount: number;
  children: React.ReactNode;
  hideTime?: boolean;
}) {
  const name = user.name ?? "Player";

  return (
    <TableRow className="group hover:bg-muted/50 transition-colors">
      <TableCell className="w-12 text-center">
        <div
          className={cn(
            "mx-auto h-8 w-8 grid place-items-center rounded-full border text-sm font-semibold tabular-nums shadow-sm",
            rankStyles(rank),
          )}
          aria-label={`Rank ${rank}`}
        >
          {rank <= 3 ? (
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          ) : (
            <span>
              {rank}
              <sup className="font-medium">{ordinal(rank)}</sup>
            </span>
          )}
        </div>
        <span className="sr-only">Rank {rank}</span>
      </TableCell>

      <TableCell>
        <div className="min-w-0">
          <div className="flex items-center sm:gap-2">
            <span className="font-medium text-xs sm:text-base">
              {truncateString(name)}
            </span>
            <Badge
              variant="secondary"
              className="cursor-default h-5 rounded-full text-[12px] tracking-wide px-0.5"
              title={`${completionCount} completions`}
            >
              x{completionCount}
            </Badge>
          </div>

          <div className="text-xs">
            {!hideTime && (
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                Time: {formatDuration(durationMs)}
              </span>
            )}
            <Badge
              variant="secondary"
              className="hidden sm:inline cursor-default h-5 rounded-full px-2 text-[10px] tracking-wide"
              title={new Date(completedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            >
              {formatRelativeTime(new Date(completedAt))}
            </Badge>
          </div>
        </div>
      </TableCell>

      {children}
    </TableRow>
  );
}

function rankStyles(rank: number) {
  if (rank === 1)
    return "border-yellow-400 text-yellow-500 bg-yellow-500/10 ring-2 ring-yellow-300/40";
  if (rank === 2)
    return "border-zinc-300 text-zinc-500 bg-zinc-400/10 ring-2 ring-zinc-300/40";
  if (rank === 3)
    return "border-amber-400 text-amber-700 bg-amber-500/10 ring-2 ring-amber-400/40";
  return "border-gray-300";
}
