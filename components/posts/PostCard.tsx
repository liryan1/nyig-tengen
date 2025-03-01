import Link from "next/link";
import { LikeButton } from "./LikeButton";
import { PostResponse } from "@/lib/rtk/slices/posts";
import { Button } from "../ui/button";
import { EditIcon, MoveRightIcon } from "lucide-react";
import { sanitizeHtml } from "@/lib/utils";

interface PostWithUserLiked extends PostResponse {
  userLiked?: boolean;
}

interface PostCardProps {
  post: PostWithUserLiked;
  isUsersPost?: boolean;
}

export function PostCard({ post, isUsersPost }: PostCardProps) {
  const { id, title, content, author, slug, publishedAt, userLiked } = post;

  const excerpt = sanitizeHtml(content);

  return (
    <div className="rounded-lg shadow-lg p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-700 text-sm line-clamp-3">{excerpt}</p>
        <Link
          href={`/posts/${slug ?? id}`}
          className="text-blue-600 text-sm hover:underline mb-2 flex justify-end items-center gap-1 py-2"
        >
          Read post
          <MoveRightIcon strokeWidth="1.5" />
        </Link>
      </div>

      <div className="flex items-center justify-between text-gray-600 mt-auto">
        <div className="text-xs">
          by <span className="font-medium">{author?.name || "Unknown"}</span> on{" "}
          <span>
            {publishedAt
              ? new Date(publishedAt).toLocaleDateString()
              : "No date"}
          </span>
        </div>
        {isUsersPost ? (
          <Link href={`/posts/edit/${slug ?? id}`}>
            <EditIcon className="cursor-pointer h-5 w-5" />
          </Link>
        ) : (
          <LikeButton
            postId={id}
            initialLiked={userLiked}
            initialCount={post.likes.length ?? 0}
          />
        )}
      </div>
    </div>
  );
}
