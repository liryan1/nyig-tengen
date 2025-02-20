"use client";

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
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { CrownIcon } from "lucide-react";

export function UserMenu() {
  const { data, status } = useSession();
  if (status !== "authenticated") {
    return (
      <Button size="sm">
        <Link href="/login">Sign in</Link>
      </Button>
    );
  }
  const handleSignout = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 md:mx-2 cursor-pointer relative">
          {data?.user?.image && <AvatarImage src={data.user.image} />}
          <AvatarFallback>{data.user.name?.at(0) ?? "?"}</AvatarFallback>
          {data?.user.role === "ADMIN" && (
            <CrownIcon
              className="h-5 w-5 absolute left-1.5 bottom-0"
              strokeWidth={2}
              strokeOpacity={0.2}
            />
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="mb-0 pb-0">
          {data.user.name}
        </DropdownMenuLabel>
        <DropdownMenuLabel className="mt-0 font-normal text-xs text-muted-foreground">
          {data.user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled onClick={() => redirect("/user")}>
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem onClick={handleSignout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
