"use client";

import * as React from "react";

import { NavMain } from "@/components/nav/root/NavMain";
import { NavTeams } from "@/components/nav/root/NavTeams";
import { NavUser } from "@/components/nav/root/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppSidebarLogo } from "./AppSidebarLogo";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain title="Tengen" />
        <NavTeams />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
