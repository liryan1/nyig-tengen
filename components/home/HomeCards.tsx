import { Button } from "@/components/ui/button";
import { LayersIcon, MoveRightIcon, Target } from "lucide-react";
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
      "Read like you play. In Tengen, you submit moves for both sides—the side to play and the opponent's best reply. This two-step workflow builds valuable real-game habits, develops deeper reading, and reduces blunders as you strengthen your mental muscle.",
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
];

export function HomeCards() {
  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
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

            <CardContent className="text-gray-700 text-sm flex-1">
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
