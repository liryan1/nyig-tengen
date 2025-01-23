"use client";

import { useGetPostBySlugQuery } from "@/lib/rtk/slices/posts";
import { CircleAlertIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { PageError } from "../labels/Error";
import { PageSpinner } from "../labels/Spinner";
import { TiptapEditForm } from "../tiptap/TiptapEditForm";

export function Editor({ slug }: { slug?: string }) {
  const userId = useSession().data?.user?.id;
  const {
    data: post,
    isLoading,
    isError,
  } = useGetPostBySlugQuery(slug ?? "", { skip: !slug });

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError) {
    <PageError>Error getting the post</PageError>;
  }

  if (slug && userId !== post?.authorId)
    return (
      <PageError className="gap-2">
        <CircleAlertIcon />
        You are not authorized to edit this post
      </PageError>
    );

  return <TiptapEditForm iform={post} />;
}
