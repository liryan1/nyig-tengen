"use client";
import { useToggleLikeMutation } from "@/lib/rtk/slices/likes";
import { HeartIcon } from "lucide-react";
import React from "react";

type LikeButtonProps = {
  postId: string;
  initialLiked?: boolean;
  initialCount: number;
};

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = React.useState(initialLiked);
  const [count, setCount] = React.useState(initialCount);
  const [toggleLike, { isLoading, isError }] = useToggleLikeMutation();

  async function handleClick() {
    if (isLoading || isError) return;
    try {
      const result = await toggleLike({ postId }).unwrap();

      // Update local states
      if (result.liked) {
        // user has just liked
        setLiked(true);
        setCount((prev) => prev + 1);
      } else {
        // user has just unliked
        setLiked(false);
        setCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      if ((error as {status: number})?.status === 401) {
        // Not logged in - you could redirect to /login or next-auth signIn()
        alert("Please log in to like a post");
      } else {
        console.error("Failed to toggle like:", error);
      }
    }
  }

  return (
    <div className="flex items-center gap-1">
      <HeartIcon
        className="cursor-pointer h-5 w-5"
        fill={liked ? "red" : "none"} stroke={liked ? "red" : "grey"}
        onClick={handleClick}
      />
      <span className="text-sm text-gray-700">{count}</span>
    </div>
  );
}
