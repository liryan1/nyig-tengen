import { logStack } from "@/lib/error";
import { getRank } from "@/lib/go/display";
import { GoProblemMeta, StoneColor } from "@/lib/go/interface";
import { useProblemLikeMutation } from "@/lib/rtk/slices/problems";
import { cn, debounce } from "@/lib/utils";
import { CircleIcon, CrownIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { InfoBar } from "../InfoBar";
import { EndorsedTooltip } from "../problem/EndorsedTooltip";
import { UserRole } from "@prisma/client";
import { PiCrownSimple } from "react-icons/pi";

type GoProblemHeaderProps = {
  num: string;
  meta: GoProblemMeta;
  initialColor?: StoneColor;
  className?: string;
};

export function GoProblemHeader({
  num,
  meta,
  initialColor = 1,
  className,
}: GoProblemHeaderProps) {
  const { rank, description, author, stats, userSolved, endorser } = meta;
  const [like, { isLoading }] = useProblemLikeMutation();
  const stoneColor = initialColor === 1 ? "black" : "white";
  const successRate =
    (stats?.correctCount ?? 0) / (stats?.submissionCount ?? 1);
  const isAuthorAdmin = author.role === UserRole.ADMIN || UserRole.SUPERADMIN;

  const { status: authStatus } = useSession();

  const toggleLike = async () => {
    if (authStatus !== "authenticated") {
      toast.error("Please login to like the problem.");
      return;
    }
    const likeProblem = async () => {
      return like(num).unwrap();
    };
    try {
      toast.promise(likeProblem, {
        loading: stats?.userLiked ? "Removing like..." : "Liking problem...",
        success: stats?.userLiked ? "Removed like" : "Liked problem",
        error: (err) => err.message,
      });
    } catch (error) {
      logStack(error);
    }
  };

  return (
    <div className={cn("flex flex-col space-y-2 p-2 sm:p-4", className)}>
      <div>
        <div className="flex justify-between items-center">
          <div className="flex gap-0.5 items-center">
            <span className="text-xs sm:text-lg text-muted-foreground">
              <Link href="#" className="flex items-center gap-0.5">
                {author.name}
                {isAuthorAdmin && (
                  <PiCrownSimple className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Link>
            </span>
            {endorser && (
              <EndorsedTooltip
                endorserName={`${endorser.name}${endorser.rank ? " " + endorser.rank : ""}`}
              />
            )}
          </div>

          <CircleIcon size={24} fill={stoneColor} />
        </div>
      </div>

      <InfoBar
        info={{
          rank: getRank(rank),
          likes: stats?.likes || 0,
          userLiked: stats?.userLiked,
          views: stats?.views ?? 0,
          rate: isNaN(successRate) || !successRate ? 0 : successRate,
          userSolved,
          convertRateToPercent: true,
        }}
        toggleLike={debounce(toggleLike, 500)}
        likeDisabled={isLoading}
      />

      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
