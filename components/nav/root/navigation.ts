import {
  ChartNoAxesCombinedIcon,
  LucideIcon,
  StarIcon,
  SwordsIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  isAdminOnly?: boolean;
  items?: NavItem[];
}

export const LEFT_SIDEBAR_MENU: NavItem[] = [
  {
    title: "Practice",
    url: "/learn",
    icon: ChartNoAxesCombinedIcon,
    isActive: true,
    items: [
      {
        title: "Starred problems",
        url: "/learn/problems?starred=true",
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
        isAdminOnly: true,
      },
    ],
  },
];
