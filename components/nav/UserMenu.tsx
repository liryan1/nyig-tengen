'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";

export function UserMenu() {
  const {data, status} = useSession()
  if (status !== "authenticated") {
    return (
      <Button size="sm">
        <Link href="/login">Sign in</Link>
      </Button>
    )
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 md:mx-2 cursor-pointer">
          <AvatarFallback>{data.user.name?.at(0) ?? "?"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="mb-0 pb-0">{data.user.name}</DropdownMenuLabel>
        <DropdownMenuLabel className="mt-0 font-normal text-xs text-muted-foreground">{data.user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled onClick={() => redirect("/user")}>
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem onClick={() => signOut()}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
