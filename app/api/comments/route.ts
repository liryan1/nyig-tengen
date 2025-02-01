import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/authOptions";
import { logStack } from "@/lib/error";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    const where: any = {};
    if (postId) {
      where.postId = postId;
    }

    const comments = await db.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const { postId, content } = await request.json();
    if (!postId || !content) {
      return NextResponse.json(
        { message: "postId and content are required" },
        { status: 400 },
      );
    }

    await db.comment.create({
      data: {
        postId,
        content,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Comment posted successfully" },
      { status: 201 },
    );
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "Failed to create comment" },
      { status: 500 },
    );
  }
}
