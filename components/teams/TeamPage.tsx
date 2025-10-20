"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useCreatePSetProgressMutation } from "@/lib/rtk/slices/problemSets";
import { useGetTeamQuery } from "@/lib/rtk/slices/teams";
import { TeamRole } from "@prisma/client";
import { UserPlus2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PageError } from "../labels/Error";
import ProblemCard from "../learn/problem/ProblemCard";
import { ProblemSetCard } from "../learn/sets/ProblemSetCard";
import { TeamPageSkeleton } from "../loading/TeamSkeleton";
import { StatefulPagination } from "../nav/StatefulPagination";
import { ScrollArea } from "../ui/scroll-area";
import { InviteMember } from "./InviteMember";

const membersLimit = 10;
const problemsLimit = 24;
const problemSetsLimit = 6;

type TeamTab = "members" | "problems" | "problemsets";

function getSlicedArray<T>(arr: T[], pageIndex: number, limit: number): T[] {
  const start = (pageIndex - 1) * limit;
  const end = start + limit;
  return arr.slice(start, end);
}

export const TeamPage = () => {
  const [problemsTabIndex, setProblemsTabIndex] = useState(1);
  const [problemSetsTabIndex, setProblemSetsTabIndex] = useState(1);
  const [membersTabIndex, setMembersTabIndex] = useState(1);

  const { slug } = useParams();
  const [activeTab, setActiveTab] = useLocalStorage<TeamTab>(
    `tengen-team-${slug}-tab`,
    "members",
  );

  const { data: session } = useSession();
  const {
    data: team,
    isLoading: tLoading,
    isError: tError,
  } = useGetTeamQuery(slug as string);
  const [createPSetProgress, { isLoading: cLoading, isError: cError }] =
    useCreatePSetProgressMutation();
  const isLoading = cLoading || tLoading;
  const isError = cError || tError;

  if (isLoading) {
    return <TeamPageSkeleton />;
  }

  if (!team) {
    return <PageError>Team not found</PageError>;
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as TeamTab);
  };

  const isTeamMember =
    team.owner.id === session?.user?.id ||
    team.members?.some((member) => member.id === session?.user?.id);
  const isTeamAdmin =
    team.owner.id === session?.user?.id ||
    team.members?.some(
      (member) =>
        member.id === session?.user?.id && member.role === TeamRole.ADMIN,
    );

  return (
    <div className="container mx-auto max-w-7xl space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground mt-2">{team.description}</p>
        </div>
        <div className="flex gap-2">
          {!isTeamMember && (
            <Button disabled>
              <UserPlus2 />
              Request to Join
            </Button>
          )}
          {isTeamAdmin && <InviteMember teamSlug={slug as string} />}
        </div>
      </div>

      {isTeamMember && (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="members">
              Members {team.memberCount}
            </TabsTrigger>
            <TabsTrigger value="problems">
              Problems {team.problems?.length}
            </TabsTrigger>
            <TabsTrigger value="problemsets">
              Problem Sets {team.problemSets?.length}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardContent className="m-0 p-0">
                <ScrollArea className="h-[60vh]">
                  <Table className="border-b">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSlicedArray(
                        team.members,
                        membersTabIndex,
                        membersLimit,
                      ).map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {member.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                            {["OWNER", "ADMIN"].includes(member.role) && (
                              <Badge variant="outline">{member.role}</Badge>
                            )}
                            {member.id === session?.user?.id && (
                              <Badge>ME</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {member.joinedAt
                              ? new Date(member.joinedAt).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-2">
                <StatefulPagination
                  currentPage={membersTabIndex}
                  onPageChange={setMembersTabIndex}
                  totalPages={
                    team.members.length
                      ? Math.ceil(team.members.length / membersLimit)
                      : 1
                  }
                />
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="problems">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[60vh]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 m-4 pr-2">
                    {getSlicedArray(
                      team.problems,
                      problemsTabIndex,
                      problemsLimit,
                    ).map((problem) => (
                      <ProblemCard
                        key={problem.num}
                        goProblemResponse={problem}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-2">
                <StatefulPagination
                  currentPage={problemsTabIndex}
                  onPageChange={setProblemsTabIndex}
                  totalPages={
                    team.problems?.length
                      ? Math.ceil(team.problems.length / problemsLimit)
                      : 1
                  }
                />
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="problemsets">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[60vh]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 m-4">
                    {getSlicedArray(
                      team.problemSets,
                      problemSetsTabIndex,
                      problemSetsLimit,
                    ).map((problemSet) => (
                      <ProblemSetCard
                        onCreatePSetProgress={createPSetProgress}
                        psetCreateError={isError}
                        psetCreateLoading={isLoading}
                        key={problemSet.num}
                        problemSet={problemSet}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-2">
                <StatefulPagination
                  currentPage={problemSetsTabIndex}
                  onPageChange={setProblemSetsTabIndex}
                  totalPages={
                    team.problemSets?.length
                      ? Math.ceil(team.problemSets.length / problemSetsLimit)
                      : 1
                  }
                />
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
