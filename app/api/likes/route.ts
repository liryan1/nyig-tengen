import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/authOptions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postId = searchParams.get("postId") || undefined;
  const commentId = searchParams.get("commentId") || undefined;
  const userId = searchParams.get("userId") || undefined;

  try {
    // Build a 'where' filter dynamically
    const where: any = {};
    if (postId) where.postId = postId;
    if (commentId) where.commentId = commentId;
    if (userId) where.userId = userId;

    const likes = await db.like.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        post: true,
        comment: true,
      },
    });

    return NextResponse.json(likes, { status: 200 });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return new NextResponse("Failed to fetch likes", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Must be logged in to like
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId, commentId } = await request.json();

    // Validate input
    if (!postId && !commentId) {
      return new NextResponse("Either 'postId' or 'commentId' is required", { status: 400 });
    }

    // Ensure user doesn't "double-like" the same post/comment
    const existingLike = await db.like.findFirst({
      where: {
        userId: session.user.id,
        postId: postId || undefined,
        commentId: commentId || undefined,
      },
    });

    if (existingLike) {
      return new NextResponse("Already liked", { status: 409 }); // Conflict
    }

    // Create the like
    await db.like.create({
      data: {
        userId: session.user.id,
        postId,
        commentId,
      },
    });

    return NextResponse.json({ status: 201 });
  } catch (error) {
    console.error("Error creating like:", error);
    return new NextResponse("Failed to create like", { status: 500 });
  }
}

/**
 * DELETE /api/likes
 * Option 1: Pass likeId in query string => ?likeId=XXX
 * Option 2: Pass postId/commentId => will delete the current user's like for that resource
 */
export async function DELETE(request: NextRequest) {
  try {
    // Must be logged in to unlike
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const likeId = searchParams.get("likeId");
    const postId = searchParams.get("postId");
    const commentId = searchParams.get("commentId");

    // We need at least one way to identify the like
    if (!likeId && !postId && !commentId) {
      return new NextResponse("Missing identifier: likeId, postId, or commentId is required", {
        status: 400,
      });
    }

    // 1. If 'likeId' is provided, delete that specific like (if owned by user).
    if (likeId) {
      // Check the like belongs to the logged-in user
      const existing = await db.like.findUnique({ where: { id: likeId } });
      if (!existing) {
        return new NextResponse("Like not found", { status: 404 });
      }
      if (existing.userId !== session.user.id) {
        return new NextResponse("Forbidden", { status: 403 });
      }

      await db.like.delete({ where: { id: likeId } });
      return new NextResponse("Like removed", { status: 204 });
    }

    // 2. Otherwise, remove by postId or commentId for the current user
    const existingLike = await db.like.findFirst({
      where: {
        userId: session.user.id,
        postId: postId || undefined,
        commentId: commentId || undefined,
      },
    });

    if (!existingLike) {
      return NextResponse.json("Like not found for this user/resource", { status: 404 });
    }

    await db.like.delete({ where: { id: existingLike.id } });
    return NextResponse.json("Like removed", { status: 204 });
  } catch (error) {
    console.error("Error removing like:", error);
    return NextResponse.json("Failed to remove like", { status: 500 });
  }
}
