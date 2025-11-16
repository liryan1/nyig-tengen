"use client";

import { Spinner } from "@/components/labels/Spinner";
import { LeaderboardTableRow } from "@/components/LeaderboardTableRow";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import {
  LeaderboardEntry,
  useChallengeLeaderboardQuery,
} from "@/lib/rtk/slices/challenge";
import { ChallengeLeaderboardPeriod } from "@prisma/client";
import { Award, Crown, Medal, Timer } from "lucide-react";
import { useSession } from "next-auth/react";
import { BsFillLightningFill } from "react-icons/bs";

export function LeaderboardTable({
  period,
}: {
  period: ChallengeLeaderboardPeriod;
}) {
  const { data: session } = useSession();
  const { data, isLoading, isError } = useChallengeLeaderboardQuery(period);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load leaderboard
      </div>
    );
  }

  const { topEntries, userEntry } = data;
  const showUserEntry =
    userEntry && !topEntries.some((e) => e.user.id === userEntry.user.id);

  return (
    <div className="space-y-4">
      <Table>
        <TableBody className="max-w-full">
          {topEntries.map((entry) => {
            const isCurrentUser = entry.user.id === session?.user?.id;
            return (
              <ChallengeLeaderboardRow
                key={entry.user.id}
                entry={entry}
                isCurrentUser={isCurrentUser}
              />
            );
          })}
        </TableBody>
      </Table>

      {showUserEntry && userEntry && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Your ranking</p>
          <Table>
            <TableBody>
              <ChallengeLeaderboardRow entry={userEntry} isCurrentUser={true} />
            </TableBody>
          </Table>
        </div>
      )}
      {topEntries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No entries yet. Be the first!
        </div>
      )}
    </div>
  );
}

function ChallengeLeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <LeaderboardTableRow
      rank={entry.rank}
      user={entry.user}
      durationMs={entry.timeSpentMs}
      completedAt={entry.completedAt}
      completionCount={entry.completionCount}
      hideTime
    >
      <TableCell>
        <div className="flex items-center justify-end gap-1 sm:gap-4">
          {isCurrentUser && <Badge variant="outline">You</Badge>}
          <div className="flex items-center gap-1">
            <Timer className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs sm:text-base">
              {(entry.timeSpentMs / 1000).toFixed(2)}s
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <BsFillLightningFill
              fill={entry.rank < 4 ? "indigo" : "gray"}
              fillOpacity={0.6}
              className="h-4 w-4 sm:h-5 sm:w-5"
            />
            <span className="font-semibold text-lg sm:text-2xl">
              {entry.problemsCorrect}
            </span>
          </div>
        </div>
      </TableCell>
    </LeaderboardTableRow>
  );
}
