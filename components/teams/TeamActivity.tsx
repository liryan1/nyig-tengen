"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetTeamActivityQuery } from "@/lib/rtk/slices/teams";
import { UserPlus, PlusCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";

export const TeamActivity = ({ slug }: { slug: string }) => {
  const { data: activity, isLoading } = useGetTeamActivityQuery(slug);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!activity || activity.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="p-0 px-6 pt-6">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            No recent activity found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {activity.map((item) => (
          <div key={item.id} className="flex gap-4 relative">
            <div className="mt-1">
              {item.type === "member_joined" ? (
                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                  <UserPlus className="h-4 w-4" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                  <PlusCircle className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm leading-tight">
                {item.type === "member_joined" ? (
                  <>
                    <span className="font-bold">{item.user?.name}</span> joined
                    the team
                  </>
                ) : (
                  <>
                    New set added:{" "}
                    <span className="font-bold">{item.contentName}</span>
                  </>
                )}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(new Date(item.createdAt))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
