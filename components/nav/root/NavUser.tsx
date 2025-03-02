"use client";

import {
  ChevronsUpDown,
  LogInIcon,
  LogOut,
  Sparkles,
  User2Icon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logStack } from "@/lib/error";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "../../ui/button";

export function NavUser() {
  const { data: session } = useSession();
  const user = session?.user;

  const { isMobile } = useSidebar();
  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Link href="/login">
            <SidebarMenuButton>
              <LogInIcon />
              <span>Sign in</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const handleSignout = async () => {
    toast.promise(signOut, {
      loading: "Signing out...",
      success: "Signed out successfully",
      error: (error) => {
        logStack(error);
        return "Failed to sign out";
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user.image && <AvatarImage src={user.image} />}
                <AvatarFallback>{user.name?.at(0) ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.image && <AvatarImage src={user.image} />}
                  <AvatarFallback>{user.name?.at(0) ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <Sparkles />
                Reward points
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <User2Icon />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleSignout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
