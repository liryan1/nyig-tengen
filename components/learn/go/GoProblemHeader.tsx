import { Button } from "@/components/ui/button";
import { logStack } from "@/lib/error";
import { getRank } from "@/lib/go/display";
import { GoProblemMeta, StoneColor } from "@/lib/go/interface";
import { useProblemLikeMutation } from "@/lib/rtk/slices/problems";
import { cn, debounce } from "@/lib/utils";
import { CircleIcon, EditIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { InfoBar } from "../InfoBar";

type GoProblemHeaderProps = {
  num: string;
  meta: GoProblemMeta;
  initialColor?: StoneColor;
  className?: string;
  hasProblemSetProgressId?: boolean;
};

export function GoProblemHeader({
  num,
  meta,
  initialColor = 1,
  className,
  hasProblemSetProgressId,
}: GoProblemHeaderProps) {
  const { rank, description, author, stats, userSolved } = meta;
  const [like, { isLoading }] = useProblemLikeMutation();
  const stoneColor = initialColor === 1 ? "black" : "white";
  const successRate =
    (stats?.correctCount ?? 0) / (stats?.submissionCount ?? 1);

  const { data: session, status: authStatus } = useSession();
  const userOwnsProblem = session?.user.id === author.id;

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
          likes: stats?.likes || 0,
          userLiked: stats?.userLiked,
          views: stats?.views ?? 0,
          rate: isNaN(successRate) || !successRate ? 0 : successRate,
          userSolved,
        }}
        toggleLike={debounce(toggleLike, 500)}
        likeDisabled={isLoading}
      />

      <div className="flex justify-between items-start">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {description}
        </p>
        {!hasProblemSetProgressId && userOwnsProblem && (
          <Link href={`/learn/problems/${num}/edit`}>
            <Button size="sm" className="gap-1">
              <span className="hidden sm:block">Edit</span>
              <EditIcon />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
