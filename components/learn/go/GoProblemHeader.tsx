import { GoProblemMeta, StoneColor } from "@/lib/go/interface";
import { cn } from "@/lib/utils";
import { CircleIcon } from "lucide-react";
import Link from "next/link";
import { InfoBar } from "../InfoBar";
import { getRank } from "@/lib/go/display";

type GoProblemHeaderProps = {
  meta: GoProblemMeta;
  initialColor?: StoneColor;
  className?: string;
};

export function GoProblemHeader({
  meta,
  initialColor = 1,
  className,
}: GoProblemHeaderProps) {
  const { rank, description, author, stats } = meta;
  const stoneColor = initialColor === 1 ? "black" : "white";
  const successRate =
    (stats?.correctCount ?? 0) / (stats?.submissionCount ?? 1);
  return (
    <div className={cn("flex flex-col space-y-2 p-2 sm:p-4", className)}>
      <div>
        <div className="flex justify-between items-center">
          <div className="text-xs sm:text-sm text-muted-foreground">
            By{" "}
            <Link className="underline" href="#">
              {author.name}
            </Link>
          </div>
          <CircleIcon size={24} fill={stoneColor} />
        </div>
      </div>

      <InfoBar
        info={{
          rank: getRank(rank),
          likes: stats?.likes,
          views: stats?.views,
          rate: successRate || isNaN(successRate) ? 0 : successRate,
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
