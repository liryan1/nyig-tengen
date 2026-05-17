import { Button } from "@/components/ui/button";
import {
  CloudLightningIcon,
  LayersIcon,
  MoveRightIcon,
  Target,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

const cards = [
  {
    titleIcon: <Target className="h-6 w-6 text-green-600" />,
    cardClassName:
      "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
    title: "Problems",
    description:
      "Read like you play. In Tengen, you submit moves for both sides—the side to play and the opponent's best reply. This two-step workflow builds valuable real-game habits while strengthening your mental muscle.",
    link: "/learn/problems",
    linkText: "Do problems",
  },
  {
    titleIcon: <LayersIcon className="h-6 w-6 text-blue-600" />,
    cardClassName: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
    title: "Problem Sets",
    description:
      "Train in focused packs. Curated by theme and rank, sets turn repetition into mastery—sharpen patterns, track streaks, and climb with your team.",
    link: "/learn/sets",
    linkText: "Tackle problem sets",
  },
  {
    titleIcon: <CloudLightningIcon className="h-6 w-6 text-indigo-600" />,
    cardClassName:
      "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200",
    title: "Challenge Mode",
    description:
      "Race against the clock in this fast-paced puzzle sprint. Start with 30 seconds, earn +3s for each correct answer, but one mistake ends your run. How long can you keep your streak alive?",
    link: "/challenge",
    linkText: "Start challenge",
  },
  {
    titleIcon: <UsersIcon className="h-6 w-6 text-amber-600" />,
    cardClassName:
      "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
    title: "Teams",
    description:
      "Progress is better with friends. Join a team or create your own to track your growth, compete on leaderboards, and master Go together.",
    link: "/teams",
    linkText: "Explore teams",
  },
];

export function HomeCards() {
  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch mb-6">
        {cards.map((card, index) => (
          <Card
            key={index}
            className={`${card.cardClassName} flex h-full flex-col`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                {card.titleIcon}
                {card.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="text-gray-700 text-xs sm:text-sm">
              {card.description}
            </CardContent>

            <CardFooter className="mt-auto">
              <div className="flex w-full justify-end">
                <Link href={card.link}>
                  <Button variant="outline" className="gap-2">
                    {card.linkText} <MoveRightIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
