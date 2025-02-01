"use client";

import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const menuConfig = [
  {
    title: "Posts",
    path: "posts",
  },
  {
    title: "Learn",
    path: "learn",
  },
];

export function NavbarLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  const activePath = pathname.split("/")[1];
  return (
    <>
      <div className={cn("sm:hidden flex items-center gap-2", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MenuIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {menuConfig.map((config, i) => (
              <DropdownMenuItem key={i}>
                <Link href={"/" + config.path}>{config.title}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className={cn("hidden sm:flex items-center gap-2", className)}>
        {menuConfig.map((config, i) => (
          <Button key={i} size="sm" variant="outline">
            <Link
              href={"/" + config.path}
              className={cn(
                "sm:px-4",
                activePath === config.path ? "text-blue-600" : "",
              )}
            >
              {config.title}
            </Link>
          </Button>
        ))}
      </div>
    </>
  );
}
