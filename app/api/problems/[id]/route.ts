import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const [session, { id }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    const userId = session?.user?.id;

    const problem = await db.problem.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        problemStats: true,
        problemLikes: {
          select: {
            userId: true,
          },
        },
      },
      omit: { correct: true },
    });
    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        id: problem.id,
        initial: problem.initial,
        rank: problem.rank,
        description: problem.description,
        author: problem.author,
        stats: {
          ...problem.problemStats,
          likes: problem.problemLikes.length,
          userLiked: problem.problemLikes.some(
            (like) => like.userId === userId,
          ),
        },
      },
      { status: 200 },
    );
  } catch (e) {
    logStack(e);
    return NextResponse.json(
      { message: "Failed to get problem" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const [{ id }, session, { title, description, rank, initial, correct }] =
      await Promise.all([params, getServerSession(authOptions), req.json()]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch the problem to verify ownership
    const existingProblem = await db.problem.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existingProblem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 },
      );
    }

    if (existingProblem.authorId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await db.problem.update({
      where: { id },
      data: {
        description,
        rank,
        initial,
        correct,
      },
    });

    return NextResponse.json({ message: "Update successful" }, { status: 200 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred while updating the problem" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const [{ id }, session] = await Promise.all([
      params,
      getServerSession(authOptions),
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingProblem = await db.problem.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existingProblem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 },
      );
    }

    if (existingProblem.authorId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await db.problem.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Problem successfully deleted" },
      { status: 204 },
    );
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred while deleting the problem" },
      { status: 500 },
    );
  }
}
