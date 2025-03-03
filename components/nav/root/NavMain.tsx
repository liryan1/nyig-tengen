"use client";

import {
  ChartNoAxesCombinedIcon,
  ChevronRight,
  NewspaperIcon,
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
import { useSession } from "next-auth/react";
import Link from "next/link";

export function NavMain({ title }: { title: string }) {
  const { data: session } = useSession();
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
        ...(session?.user?.role === "ADMIN" ||
        session?.user?.role === "SUPERADMIN"
          ? [
              {
                title: "Create problem",
                url: "/learn/problems/new",
              },
            ]
          : []),
      ],
    },
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
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
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
