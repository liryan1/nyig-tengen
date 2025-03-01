"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { TeamPageSkeleton } from "../loading/TeamSkeleton";

export const TeamPage = () => {
  const { slug } = useParams();
  const { data: session } = useSession();
  const { data: team, isLoading } = useGetTeamQuery(slug as string);

  if (isLoading) {
    return <TeamPageSkeleton />;
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  const isTeamMember = team.members?.some(
    (member) => member.id === session?.user?.id,
  );

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
        <Card>
          <CardHeader>
            <CardTitle>Team Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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

        <Card>
          <CardHeader>
            <CardTitle>Team Owner</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
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
      </div>

      {isTeamMember && (
        <Tabs defaultValue="members">
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
                        {new Date(member.joinedAt).toLocaleDateString()}
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
                <CardTitle>Team Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {team.problems?.map((problem) => (
                    <div
                      key={problem.id}
                      className="flex items-center justify-between p-4 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Rank: {problem.rank}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="problemsets">
            <Card>
              <CardHeader>
                <CardTitle>Problem Sets</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {team.problemSets?.map((set) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between p-4 border-b last:border-0"
                    >
                      <div>
                        <h3 className="font-medium">{set.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {set.problemCount} problems
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Start
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
