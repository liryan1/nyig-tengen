"use client";

import { Frame, Map, PieChart } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav/root/NavMain";
import { NavProjects } from "@/components/nav/root/NavProjects";
import { NavUser } from "@/components/nav/root/NavUser";
import { TeamSwitcher } from "@/components/nav/root/TeamSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { AppSidebarLogo } from "./AppSidebarLogo";

const data = {
  teams: [
    {
      name: "Intermediate 1",
      plan: "Fall 2025",
    },
    {
      name: "Path to Pro",
      plan: "Fall 2025",
    },
    {
      name: "Competition",
      plan: "Fall 2025",
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSidebarLogo />
        {/* {status === "authenticated" ? <TeamSwitcher /> : <AppSidebarLogo />} */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain title="Tengen" />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
