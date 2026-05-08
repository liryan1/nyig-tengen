"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGetTeamStatsMeQuery } from "@/lib/rtk/slices/teams";
import { Trophy, CheckCircle2, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useQueryState } from "nuqs";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export const TeamImpact = ({ slug }: { slug: string }) => {
  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <TeamImpactContent slug={slug} />
    </Suspense>
  );
};

const TeamImpactContent = ({ slug }: { slug: string }) => {
  const [period, setPeriod] = useQueryState("period", {
    defaultValue: "all",
    shallow: false,
  });
  const {
    data: stats,
    isLoading,
    isFetching,
  } = useGetTeamStatsMeQuery({
    slug,
    period: "all",
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 md:h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const problemPercent =
    stats.totalTeamProblems > 0
      ? (stats.problemsSolved / stats.totalTeamProblems) * 100
      : 0;

  const setPercent =
    stats.totalTeamSets > 0
      ? (stats.setsCompleted / stats.totalTeamSets) * 100
      : 0;

  return (
    <div className="space-y-3 md:space-y-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg md:text-xl font-semibold tracking-tight">
            My Impact
          </h2>
          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <Select value="all" onValueChange={setPeriod} disabled>
          <SelectTrigger className="w-[120px] md:w-[140px] h-8 md:h-9 text-xs md:text-sm">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}
      >
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Problems Solved
            </CardTitle>
            <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">
              {stats.problemsSolved} / {stats.totalTeamProblems}
            </div>
            <Progress
              value={problemPercent}
              className="mt-1 md:mt-2 h-1.5 md:h-2"
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Sets Completed
            </CardTitle>
            <Target className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">
              {stats.setsCompleted} / {stats.totalTeamSets}
            </div>
            <Progress
              value={setPercent}
              className="mt-1 md:mt-2 h-1.5 md:h-2"
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Top Ranked Set
            </CardTitle>
            <Trophy className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
            {stats.topRankedSet ? (
              <>
                <div
                  className="text-sm md:text-base font-bold truncate"
                  title={stats.topRankedSet.name}
                >
                  {stats.topRankedSet.name}
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  Rank:{" "}
                  <span className="font-bold text-foreground">
                    {stats.topRankedSet.rank}
                  </span>
                </p>
              </>
            ) : (
              <div className="text-muted-foreground text-xs md:text-sm">
                No sets ranked yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
