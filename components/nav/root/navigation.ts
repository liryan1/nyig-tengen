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
  isSignedInOnly?: boolean;
  items?: NavItem[];
}

export const LEFT_SIDEBAR_MENU: NavItem[] = [
  {
    title: "Practice",
    url: "/learn/sets",
    icon: ChartNoAxesCombinedIcon,
    isActive: true,
    items: [
      {
        title: "Problem sets",
        url: "/learn/sets",
      },
      {
        title: "Problems",
        url: "/learn/problems",
      },
      {
        title: "Starred problems",
        url: "/learn/problems?starred=true",
        isSignedInOnly: true,
      },
      {
        title: "Create problem",
        url: "/learn/problems/new",
        isAdminOnly: true,
      },
    ],
  },
  {
    title: "Challenge",
    url: "/challenge",
    icon: SwordsIcon,
    isActive: true,
    items: [
      {
        title: "Home",
        url: "/challenge",
      },
      {
        title: "Run",
        url: "/challenge/run",
      },
    ],
  },
];
