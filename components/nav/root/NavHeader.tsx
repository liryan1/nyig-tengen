"use client";

import { ShowCoordProvider } from "@/components/providers/ShowCoordProvider";
import { SidebarInset } from "@/components/ui/sidebar";
import React from "react";
import AppSidebarHeader from "./AppSidebarHeader";

export function NavHeader({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset>
      <AppSidebarHeader />
      <ShowCoordProvider>
        <main className="px-2 sm:px-4">{children}</main>
      </ShowCoordProvider>
    </SidebarInset>
  );
}
