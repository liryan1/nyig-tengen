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
import { useGetTeamQuery } from "@/lib/rtk/slices/teams";
import { UserPlus2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import ProblemCard from "../learn/problem/ProblemCard";
import { ProblemSetCard } from "../learn/sets/ProblemSetCard";
import { TeamPageSkeleton } from "../loading/TeamSkeleton";
import { StatefulPagination } from "../nav/StatefulPagination";
import { ScrollArea } from "../ui/scroll-area";
import { PageError } from "../labels/Error";

const problemLimit = 20;
const problemSetLimit = 4;

export const TeamPage = () => {
  const [problemPageIndex, setProblemPageIndex] = useState(1);
  const [problemSetPageIndex, setProblemSetPageIndex] = useState(1);
  const { slug } = useParams();
  const { data: session } = useSession();
  const { data: team, isLoading } = useGetTeamQuery(slug as string);

  if (isLoading) {
    return <TeamPageSkeleton />;
  }

  if (!team) {
    return <PageError>Team not found</PageError>;
  }

  const isTeamMember =
    team.owner.id === session?.user?.id ||
    team.members?.some((member) => member.id === session?.user?.id);

  return (
    <div className="container mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground mt-2">{team.description}</p>
        </div>
        {!isTeamMember && (
          <Button>
            <UserPlus2 />
            Request to Join
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-0">
          <CardContent className="p-0 pl-6 flex items-center space-x-4 h-full">
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
        <Tabs defaultValue="problems">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="problemsets">Problem Sets</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.members?.map((member) => (
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
                            member.role === "OWNER" ? "default" : "secondary"
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
            </Card>
          </TabsContent>

          <TabsContent value="problems">
            <Card>
              <CardHeader>
                <CardTitle>Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pr-2">
                    {team.problems.map((problem) => (
                      <ProblemCard
                        key={problem.id}
                        goProblemResponse={problem}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <StatefulPagination
                  currentPage={problemPageIndex}
                  onPageChange={setProblemPageIndex}
                  totalPages={
                    team.problems?.length
                      ? Math.ceil(team.problems.length / problemLimit)
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
                <ScrollArea className="h-[450px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 4xl:grid-cols-4 6xl:grid-cols-5 gap-4">
                    {team.problemSets.map((problemSet) => (
                      <ProblemSetCard
                        key={problemSet.id}
                        problemSet={problemSet}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <StatefulPagination
                  currentPage={problemSetPageIndex}
                  onPageChange={setProblemSetPageIndex}
                  totalPages={
                    team.problems?.length
                      ? Math.ceil(team.problems.length / problemSetLimit)
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
