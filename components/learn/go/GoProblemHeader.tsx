import { getColorLabel, getNextColor, getRank } from "@/lib/go/goLogic";
import { ProblemResponse, StoneColor } from "@/lib/go/interface";
import { cn, formatLargeNumber } from "@/lib/utils";
import {
  CheckCircleIcon,
  CircleIcon,
  EyeIcon,
  HeartIcon,
  SwordsIcon,
} from "lucide-react";
import Link from "next/link";
import { InfoBar } from "../InfoBar";

type GoProblemHeaderProps = {
  meta: ProblemResponse;
  initialColor: StoneColor;
  className?: string;
  problemTitle?: string;
};

export function GoProblemHeader({
  meta,
  initialColor,
  className,
  problemTitle,
}: GoProblemHeaderProps) {
  const { rank, description, author, problemSet, problemStats: stats } = meta;
  const stoneColor = getColorLabel(
    getNextColor(initialColor),
  ).toLocaleLowerCase();

  return (
    <div
      className={cn(
        "p-2 sm:p-4 border rounded-md shadow-sm flex flex-col space-y-2",
        className,
      )}
    >
      <div>
        <div className="flex justify-between items-center">
          <h2 className="sm:text-xl font-medium">
            {problemTitle ?? "Go Problem"}
          </h2>
          <CircleIcon size={24} fill={stoneColor} />
        </div>
      </div>

      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
        <div>
          By{" "}
          <Link className="underline" href="#">
            {author.name}
          </Link>
        </div>
        {problemSet && (
          <Link className="underline" href="#">
            {problemSet.name}
          </Link>
        )}
      </div>

      <InfoBar
        info={{
          rank: getRank(rank),
          likes: stats?.likes,
          views: stats?.views,
          rate: (stats?.correctCount ?? 0) / (stats?.submissionCount ?? 1),
        }}
      />

      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
