"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreatePSetProgressMutation } from "@/lib/rtk/slices/problemSets";
import { useGetTeamQuery } from "@/lib/rtk/slices/teams";
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
import { TeamRole } from "@prisma/client";
import useLocalStorage from "@/hooks/useLocalStorage";

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

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
        <Card className="p-0">
          <CardContent className="p-2 sm:p-0 sm:pl-6 flex items-center space-x-4 h-full">
            <Avatar>
              <AvatarFallback>
                {team.owner.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{team.owner.name}</p>
              <p className="text-sm text-muted-foreground">Owner</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Members</span>
              <span className="font-medium">{team.memberCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Problems</span>
              <span className="font-medium">{team.problems?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Problem Sets</span>
              <span className="font-medium">
                {team.problemSets?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {isTeamMember && (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="problemsets">Problem Sets</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardContent className="m-0 p-0">
                <ScrollArea className="h-[450px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
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
                          <TableCell className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>
                                {member.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                ["ADMIN", "OWNER"].includes(member.role)
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.role}
                            </Badge>
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
              <CardFooter>
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
              <CardHeader>
                <CardTitle>Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[460px]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pr-2">
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
              <CardFooter>
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
              <CardHeader>
                <CardTitle>Problem Sets</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[460px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <CardFooter>
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
