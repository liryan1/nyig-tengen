import { ChartNoAxesCombinedIcon, LucideIcon, StarIcon } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem[];
}

export const LEFT_SIDEBAR_MENU: NavItem[] = [
  {
    title: "Starred problems",
    url: "/learn/problems?starred=true",
    icon: StarIcon,
  },
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
    ],
  },
];
