import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/authOptions";

type Params = { params: Promise<{ commentId: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const { commentId } = await params;
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 });
    }
    return NextResponse.json(comment, { status: 200 });
  } catch (error) {
    console.error("Error fetching comment:", error);
    return new NextResponse("Failed to fetch comment", { status: 500 });
  }
}

// PATCH /api/comments/:commentId
export async function PATCH(request: Request, { params }: Params) {
  try {
    // 1. Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse body
    const { commentId } = await params;
    const { content } = await request.json();
    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // 3. Find existing comment
    const existingComment = await db.comment.findUnique({ where: { id: commentId } });
    if (!existingComment) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    // 4. Check ownership
    if (existingComment.authorId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 5. Update comment
    const updated = await db.comment.update({
      where: { id: commentId },
      data: { content },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating comment:", error);
    return new NextResponse("Failed to update comment", { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    // 1. Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { commentId } = await params;
    // 2. Find existing comment
    const existingComment = await db.comment.findUnique({ where: { id: commentId } });
    if (!existingComment) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    // 3. Check ownership
    if (existingComment.authorId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 4. Delete comment
    await db.comment.delete({ where: { id: commentId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return new NextResponse("Failed to delete comment", { status: 500 });
  }
}
