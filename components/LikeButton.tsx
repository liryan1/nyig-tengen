"use client";
import { debounce } from "@/lib/debounce";
import { useToggleLikeMutation } from "@/lib/rtk/slices/likes";
import { HeartIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export type LikeButtonProps = {
  postId: string;
  initialLiked?: boolean;
  initialCount: number;
  size?: number;
};

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  size = 5,
}: LikeButtonProps) {
  const [liked, setLiked] = React.useState(initialLiked);
  const [count, setCount] = React.useState(initialCount);
  const [toggleLike, { isLoading, isError }] = useToggleLikeMutation();

  async function handleClick() {
    if (isLoading || isError) return;
    try {
      toggleLike({ postId });
      if (!liked) {
        setLiked(true);
        setCount((prev) => prev + 1);
      } else {
        setLiked(false);
        setCount((prev) => Math.max(prev - 1, 0));
      }
      toast.success(liked ? "Unliked post" : "Liked post");
    } catch (error) {
      if ((error as { status: number })?.status === 401) {
        toast.warning("You must be logged in to like a post");
      } else {
        console.error("Failed to toggle like:", error);
      }
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      <HeartIcon
        className={`cursor-pointer h-${size} w-${size}`}
        fill={liked ? "red" : "none"}
        stroke={liked ? "red" : "grey"}
        onClick={debounce(handleClick, 800)}
      />
      <span className={`${size >= 8 ? "text-lg" : "text-sm"} text-gray-700`}>
        {count}
      </span>
    </div>
  );
}
