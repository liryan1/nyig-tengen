"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGetTeamStatsMeQuery } from "@/lib/rtk/slices/teams";
import { Trophy, CheckCircle2, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const TeamImpact = ({ slug }: { slug: string }) => {
  const { data: stats, isLoading } = useGetTeamStatsMeQuery(slug);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.problemsSolved} / {stats.totalTeamProblems}
          </div>
          <Progress value={problemPercent} className="mt-2 h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sets Completed</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.setsCompleted} / {stats.totalTeamSets}
          </div>
          <Progress value={setPercent} className="mt-2 h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Ranked Set</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          {stats.topRankedSet ? (
            <>
              <div
                className="text-lg font-bold truncate"
                title={stats.topRankedSet.name}
              >
                {stats.topRankedSet.name}
              </div>
              <p className="text-xs text-muted-foreground">
                Rank:{" "}
                <span className="font-bold text-foreground">
                  {stats.topRankedSet.rank}
                </span>
              </p>
            </>
          ) : (
            <div className="text-muted-foreground text-sm">
              No sets ranked yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
