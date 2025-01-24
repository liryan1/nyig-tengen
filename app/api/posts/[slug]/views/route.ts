// app/api/posts/[postId]/views/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { slug } = await params;

    await db.post.update({
      where: { slug },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return new NextResponse("Failed to update view count", { status: 500 });
  }
}
