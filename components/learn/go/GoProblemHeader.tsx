import { logStack } from "@/lib/error";
import { getRank } from "@/lib/go/display";
import { GoProblemMeta, StoneColor } from "@/lib/go/interface";
import { useProblemLikeMutation } from "@/lib/rtk/slices/problems";
import { cn, debounce } from "@/lib/utils";
import { CircleIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { InfoBar } from "../InfoBar";

type GoProblemHeaderProps = {
  pId: string;
  meta: GoProblemMeta;
  initialColor?: StoneColor;
  className?: string;
};

export function GoProblemHeader({
  pId,
  meta,
  initialColor = 1,
  className,
}: GoProblemHeaderProps) {
  const { rank, description, author, stats } = meta;
  const [like] = useProblemLikeMutation();
  const [userLiked, setUserLiked] = useState(!!stats?.userLiked);
  const [likes, setLikes] = useState(stats?.likes ?? 0);
  const stoneColor = initialColor === 1 ? "black" : "white";
  const successRate =
    (stats?.correctCount ?? 0) / (stats?.submissionCount ?? 1);

  const { status: authStatus } = useSession();

  const toggleLike = async () => {
    if (authStatus !== "authenticated") {
      toast.error("Please login to like the problem.");
      return;
    }
    const likeProblem = async () => {
      const { liked } = await like(pId).unwrap();
      setUserLiked(!userLiked);
      setLikes((prev) => (userLiked ? prev - 1 : prev + 1));
      return liked;
    };
    try {
      toast.promise(likeProblem, {
        loading: userLiked ? "Removing like..." : "Liking problem...",
        success: userLiked ? "Removed like" : "Liked problem",
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
          likes,
          userLiked,
          views: stats?.views ?? 0,
          rate: isNaN(successRate) || !successRate ? 0 : successRate,
        }}
        toggleLike={debounce(toggleLike, 300)}
      />

      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
