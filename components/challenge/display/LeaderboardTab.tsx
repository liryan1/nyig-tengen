import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengeLeaderboardPeriod } from "@prisma/client";
import { useState } from "react";
import { LeaderboardTable } from "./LeaderboardTable";

const LEADERBOARD_PERIODS = [
  { key: ChallengeLeaderboardPeriod.DAY, label: "Daily" },
  { key: ChallengeLeaderboardPeriod.WEEK, label: "Weekly" },
  { key: ChallengeLeaderboardPeriod.MONTH, label: "Monthly" },
  { key: ChallengeLeaderboardPeriod.YEAR, label: "Year" },
  { key: ChallengeLeaderboardPeriod.ALLTIME, label: "All Time" },
];

export function LeaderboardTab() {
  const [period, setPeriod] = useState<ChallengeLeaderboardPeriod>(
    ChallengeLeaderboardPeriod.ALLTIME,
  );

  return (
    <Card>
      <CardHeader className="p-0 sm:pb-0">
        <Tabs
          className="w-full overflow-x-auto"
          value={period}
          onValueChange={(v) => setPeriod(v as ChallengeLeaderboardPeriod)}
        >
          <TabsList className="grid w-full grid-cols-5">
            {LEADERBOARD_PERIODS.map((p) => (
              <TabsTrigger
                key={p.key}
                value={p.key}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        <LeaderboardTable period={period} />
      </CardContent>
    </Card>
  );
}
