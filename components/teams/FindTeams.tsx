"use client";

import { useState, useMemo } from "react";
import {
  useGetTeamsQuery,
  useRequestToJoinTeamMutation,
  useRespondToInviteMutation,
  TeamResponse,
} from "@/lib/rtk/slices/teams";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  BookOpen,
  Hash,
  Search,
  CheckIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { InviteStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export const FindTeams = () => {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError } = useGetTeamsQuery({
    limit: 100, // Fetch many for client-side search/pagination as requested
  });
  const [requestToJoin, { isLoading: isRequesting }] =
    useRequestToJoinTeamMutation();
  const [respondToInvite, { isLoading: isResponding }] =
    useRespondToInviteMutation();

  const filteredTeams = useMemo(() => {
    if (!data?.teams) return [];
    return data.teams.filter((team) =>
      team.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
  const paginatedTeams = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTeams.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTeams, currentPage]);

  const handleJoinRequest = async (slug: string) => {
    try {
      await requestToJoin(slug).unwrap();
      toast.success("Join request sent successfully!");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to send join request.");
    }
  };

  const handleAcceptInvite = async (slug: string) => {
    try {
      await respondToInvite({
        slug,
        action: InviteStatus.ACCEPTED,
      }).unwrap();
      toast.success("Joined team successfully!");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to join team.");
    }
  };

  if (isError) {
    return (
      <div className="flex justify-center py-10">
        <Alert
          variant="destructive"
          className="max-w-md flex items-center gap-3 py-3 [&>svg]:static [&>svg]:translate-y-0 [&>svg+div]:translate-y-0 [&>svg~*]:pl-0"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <AlertDescription className="font-medium">
            Error loading teams. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-bold">Find Teams</h1>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {!isLoggedIn && (
        <Alert className="bg-amber-50 border-amber-400 text-amber-700 flex items-center gap-3 py-3 [&>svg]:static [&>svg]:translate-y-0 [&>svg+div]:translate-y-0 [&>svg~*]:pl-0 [&>svg]:text-current">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <AlertDescription className="font-medium">
            You must be logged in to view team pages or request to join.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : paginatedTeams.length === 0 ? (
        <div className="text-center py-20 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">
            No teams found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onJoin={() => handleJoinRequest(team.slug)}
              onAccept={() => handleAcceptInvite(team.slug)}
              isRequesting={isRequesting || isResponding}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

const TeamCard = ({
  team,
  onJoin,
  onAccept,
  isRequesting,
  isLoggedIn,
}: {
  team: TeamResponse;
  onJoin: () => void;
  onAccept: () => void;
  isRequesting: boolean;
  isLoggedIn: boolean;
}) => {
  const badge = team.myRole ? (
    <Badge variant="secondary" className="flex items-center gap-1">
      <CheckCircle2 className="h-3 w-3" /> {team.myRole}
    </Badge>
  ) : team.hasPendingRequest ? (
    <Badge variant="outline" className="flex items-center gap-1">
      <Clock className="h-3 w-3" />{" "}
      {team.pendingInviteType === "INVITE" ? "Invited" : "Requested"}
    </Badge>
  ) : null;
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          {isLoggedIn ? (
            <Link href={`/teams/${team.slug}`} className="hover:underline">
              {team.name}
            </Link>
          ) : (
            <span className="text-muted-foreground cursor-not-allowed">
              {team.name}
            </span>
          )}
          {badge}
        </CardTitle>
        <CardDescription className="line-clamp-2 min-h-[3rem]">
          {team.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{team.memberCount} members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>{team.problemSetCount} sets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash className="h-4 w-4" />
            <span>{team.problemCount} problems</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link
          href={`/teams/${team.slug}`}
          className={cn("flex-1", !isLoggedIn && "pointer-events-none")}
        >
          <Button variant="outline" className="w-full" disabled={!isLoggedIn}>
            View Page
          </Button>
        </Link>
        {!team.myRole && !team.hasPendingRequest && (
          <Button
            className="flex-1"
            onClick={onJoin}
            disabled={isRequesting || !isLoggedIn}
          >
            Join Team
          </Button>
        )}
        {!team.myRole &&
          team.hasPendingRequest &&
          team.pendingInviteType === "INVITE" && (
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={onAccept}
              disabled={isRequesting || !isLoggedIn}
            >
              <CheckIcon className="h-3.5 w-3.5 mr-1" />
              Accept
            </Button>
          )}
      </CardFooter>
    </Card>
  );
};
