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
      return new NextResponse("Post not found", { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    logStack(error);
    return new NextResponse("Failed to fetch post", { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Not authorized", { status: 401 });
    }

    const { title, content } = await request.json();

    const existingPost = await db.post.findUnique({ where: { slug: slug } });
    if (!existingPost) {
      return new NextResponse("Post not found", { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return new NextResponse("Not authorized to update this post", {
        status: 403,
      });
    }

    await db.post.update({
      where: { slug: slug },
      data: {
        title: title ?? existingPost.title,
        content: content ?? existingPost.content,
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json("Failed to update post", { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { slug } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Not authorized", { status: 401 });
    }

    const existingPost = await db.post.findUnique({ where: { slug: slug } });
    if (!existingPost) {
      return new NextResponse("Post not found", { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return new NextResponse("Not authorized to delete this post", {
        status: 403,
      });
    }

    await db.post.delete({
      where: { id: existingPost.id },
    });

    return NextResponse.json({ status: 204 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json("Failed to delete post", { status: 500 });
  }
}
