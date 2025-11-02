import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
              {truncate(name)}
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
              {relativeTime(completedAt)}
            </Badge>
          </div>
        </div>
      </TableCell>

      {children}
    </TableRow>
  );
}

const truncate = (s: string) => {
  return s.length > 15 ? s.slice(0, 15) + "..." : s;
};

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
  return "border-gray-300";
}
