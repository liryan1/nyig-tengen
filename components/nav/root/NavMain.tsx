"use client";

import {
  ChartNoAxesCombinedIcon,
  ChevronRight,
  NewspaperIcon,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Learn",
    url: "/learn",
    icon: ChartNoAxesCombinedIcon,
    isActive: true,
    items: [
      {
        title: "Home",
        url: "/learn",
      },
      {
        title: "Problems",
        url: "/learn/problems",
      },
      {
        title: "Problem sets",
        url: "/learn/sets",
      },
      {
        title: "Create problem",
        url: "/learn/problems/new",
      },
    ],
  },
  // {
  //   title: "Teams",
  //   url: "/teams",
  //   icon: UsersRound,
  //   items: [
  //     {
  //       title: "Home",
  //       url: "/teams",
  //     },
  //   ],
  // },
  {
    title: "Posts",
    url: "/posts",
    icon: NewspaperIcon,
    items: [
      {
        title: "Posts",
        url: "/posts",
      },
      {
        title: "Create",
        url: "/posts/new",
      },
    ],
  },
];

export function NavMain({ title }: { title: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
