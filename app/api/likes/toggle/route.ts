import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/authOptions";

/**
 * POST /api/likes/toggle
 * Body: { postId?: string, commentId?: string }
 *
 * - If the user has not liked the target yet, create a new like.
 * - If the user already liked it, remove the existing like.
 *
 * Returns JSON:
 * {
 *   "liked": boolean,
 *   "like": { ... } | null
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse request body
    const { postId, commentId } = await request.json();

    // Must provide either a postId or commentId
    if (!postId && !commentId) {
      return new NextResponse("Either postId or commentId is required", { status: 400 });
    }

    // 3. Check if user already has a like for this resource
    const existingLike = await db.like.findFirst({
      where: {
        userId: session.user.id,
        postId: postId || undefined,
        commentId: commentId || undefined,
      },
    });

    // 4. Toggle logic
    if (existingLike) {
      // Already liked => remove the like
      await db.like.delete({ where: { id: existingLike.id } });
      return NextResponse.json({liked: false}, { status: 200 });
    } else {
      // Not liked yet => create the like
      const newLike = await db.like.create({
        data: {
          userId: session.user.id,
          postId: postId || null,
          commentId: commentId || null,
        },
      });
      return NextResponse.json({ liked: true }, { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return new NextResponse("Failed to toggle like", { status: 500 });
  }
}
