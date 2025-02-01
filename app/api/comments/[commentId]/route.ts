import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/authOptions";
import { logStack } from "@/lib/error";

type Params = { params: Promise<{ commentId: string }> };

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
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(comment, { status: 200 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "Failed to fetch comment" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    // 1. Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body
    const { commentId } = await params;
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 },
      );
    }

    // 3. Find existing comment
    const existingComment = await db.comment.findUnique({
      where: { id: commentId },
    });
    if (!existingComment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 },
      );
    }

    // 4. Check ownership
    if (existingComment.authorId !== session.user.id) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    // 5. Update comment
    const updated = await db.comment.update({
      where: { id: commentId },
      data: { content },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    // 1. Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;
    // 2. Find existing comment
    const existingComment = await db.comment.findUnique({
      where: { id: commentId },
    });
    if (!existingComment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 },
      );
    }

    // 3. Check ownership
    if (existingComment.authorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 4. Delete comment
    await db.comment.delete({ where: { id: commentId } });
    return NextResponse.json({ message: "Comment deleted" }, { status: 204 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
