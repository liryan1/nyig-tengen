"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetTeamLeaderboardQuery } from "@/lib/rtk/slices/teams";
import { useState } from "react";
import { StatefulPagination } from "../nav/StatefulPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryState } from "nuqs";
import { Loader2 } from "lucide-react";

export const TeamLeaderboard = ({
  slug,
  currentUserId,
}: {
  slug: string;
  currentUserId?: string;
}) => {
  const [page, setPage] = useState(1);
  const [period] = useQueryState("period", {
    defaultValue: "week",
  });

  const { data, isLoading, isFetching } = useGetTeamLeaderboardQuery({
    slug,
    page,
    period: "all",
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!data) return null;

  return (
    <Card className="h-full flex flex-col relative overflow-hidden">
      <CardHeader className="p-0 px-6 pt-6 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Leaderboard</CardTitle>
        {isFetching && (
          <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Updating results...</span>
          </div>
        )}
      </CardHeader>

      {/* Visual loading bar at the top of the card content area */}
      <div className="h-0.5 w-full bg-transparent relative">
        {isFetching && (
          <div className="absolute inset-0 bg-primary/30 animate-pulse" />
        )}
      </div>

      <CardContent className="flex-1 p-0 px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Member</TableHead>
              <TableHead className="text-right">Problems</TableHead>
              <TableHead className="text-right">Sets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.members.map((member) => (
              <TableRow
                key={member.id}
                className={member.id === currentUserId ? "bg-muted/50" : ""}
              >
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px]">
                      {(member.assignedName || member.name)
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium leading-none flex items-center gap-1.5 truncate">
                      {member.assignedName || member.name}
                      {member.id === currentUserId && (
                        <Badge
                          variant="secondary"
                          className="h-3.5 px-1 text-[9px] font-bold"
                        >
                          YOU
                        </Badge>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {member.assignedName ? `(${member.name}) ` : ""}
                      {member.role}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-right font-mono text-xs">
                  {member.problemsSolved}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {member.setsCompleted}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="p-2 mt-auto">
        <StatefulPagination
          currentPage={page}
          onPageChange={setPage}
          totalPages={data.totalPages}
        />
      </CardFooter>
    </Card>
  );
};
