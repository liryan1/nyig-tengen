import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { logStack } from "@/lib/error";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;

  try {
    const post = await db.post.findUnique({
      where: { slug: slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const { title, content, wordCount } = await request.json();

    const existingPost = await db.post.findUnique({ where: { slug: slug } });
    if (!existingPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "Not authorized" },
        {
          status: 403,
        },
      );
    }

    await db.post.update({
      where: { slug: slug },
      data: {
        title: title ?? existingPost.title,
        content: content ?? existingPost.content,
        wordCount,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Post updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { message: "Failed to update post" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { slug } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const existingPost = await db.post.findUnique({ where: { slug: slug } });
    if (!existingPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "Not authorized" },
        {
          status: 403,
        },
      );
    }

    await db.post.delete({
      where: { id: existingPost.id },
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 204 },
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "Failed to delete post" },
      { status: 500 },
    );
  }
}
