"use client";

import {
  CircleUserRoundIcon,
  Forward,
  LogOutIcon,
  MailboxIcon,
  MoreHorizontal,
  PlusCircleIcon,
  SearchIcon,
  UsersRoundIcon,
} from "lucide-react";

import { Logo } from "@/components/labels/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  useGetMyTeamsQuery,
  useGetTeamInvitesQuery,
} from "@/lib/rtk/slices/teams";
import { Skeleton } from "@/components/ui/skeleton";
import { isUserAdmin } from "@/lib/utils";

export function NavTeams() {
  const { data: session } = useSession();
  const { isMobile } = useSidebar();
  const userName = session?.user?.name;
  const { data: myTeams, isLoading: tLoading } = useGetMyTeamsQuery();
  const { data: invites, isLoading: iLoading } = useGetTeamInvitesQuery(
    undefined,
    {
      skip: !session?.user.id,
    },
  );
  const numInvites = invites?.length ?? 0;
  const isLoading = tLoading || iLoading;
  const teams = [
    ...(userName
      ? [
          {
            name: `${userName}'s Personal Team`,
            slug: "me",
          },
        ]
      : []),
    ...(myTeams ?? []),
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Teams</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ? (
          <Skeleton className="w-full h-10" />
        ) : (
          teams.map((item) => (
            <SidebarMenuItem key={item.slug}>
              <SidebarMenuButton asChild tooltip={item.name}>
                <Link href={`/teams/${item.slug}`}>
                  {item.slug === "me" ? (
                    <CircleUserRoundIcon />
                  ) : (
                    <Logo h={16} />
                  )}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger disabled asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <UsersRoundIcon className="text-muted-foreground" />
                    <span>View Team</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward className="text-muted-foreground" />
                    <span>Share Team</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOutIcon />
                    <span>Leave Team</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}
        {session?.user && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Invitations">
              <Link href="/teams/invites">
                <div className="relative text-sm h-4 w-4">
                  <MailboxIcon className="h-4 w-4" />
                  {numInvites > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-semibold text-white">
                      {numInvites > 9 ? "9+" : numInvites}
                    </span>
                  )}
                </div>
                <span>Invitations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        {isUserAdmin(session) && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Create team">
              <Link href="/teams/new">
                <PlusCircleIcon />
                <span>Create team</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
          <Link href="#">
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <SearchIcon className="text-sidebar-foreground/70" />
              <span>Find Teams</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
