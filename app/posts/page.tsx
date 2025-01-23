"use client";

import { Heading } from "@/components/labels/Heading";
import { PageSpinner } from "@/components/labels/Spinner";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { useGetPostsQuery } from "@/lib/rtk/slices/posts";
import { CirclePlusIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PostsPage() {
  const userId = useSession().data?.user?.id;
  const { data, error, isLoading } = useGetPostsQuery({
    page: 1,
    limit: 10,
  });

  if (isLoading) {
    return <PageSpinner />;
  }

  if (error) {
    return <div className="flex justify-center p-10">Error loading posts!</div>;
  }

  const posts = (data?.data ?? []).map((post) => ({
    ...post,
    userLiked: post.likes.some((like) => like.userId === userId),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Button>
        <Link href="/posts/new" className="flex items-center gap-2">
          <CirclePlusIcon />
          Write a post
        </Link>
      </Button>
      <Heading>Latest Posts</Heading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isUsersPost={userId === post.authorId}
          />
        ))}
      </div>
    </div>
  );
}
