// app/api/posts/[postId]/views/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { params: Promise<{ postId: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { postId } = await params;

    const existingPost = await db.post.findUnique({
      where: { id: postId },
      select: { views: true },
    });
    if (!existingPost) {
      return new NextResponse("Post not found", { status: 404 });
    }

    await db.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        id: true,
        views: true,
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return new NextResponse("Failed to update view count", { status: 500 });
  }
}
