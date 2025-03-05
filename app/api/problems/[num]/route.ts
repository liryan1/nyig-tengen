import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";
import { Visibility } from "@prisma/client";
import { getProblemSelect, mapProblemResponse } from "../problemQuery";

type Params = { params: Promise<{ num: string }> };
type QueryParams = {
  isEdit?: boolean;
};

export async function GET(req: Request, { params }: Params) {
  try {
    const [session, { num }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const qParams: QueryParams = Object.fromEntries(searchParams.entries());

    const problem = await db.problem.findUnique({
      where: { num },
      select: { ...getProblemSelect(userId), correct: true },
    });
    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 },
      );
    }
    const includeCorrect = qParams.isEdit && userId === problem.author.id;

    return NextResponse.json(
      {
        ...mapProblemResponse(problem, userId),
        correct: includeCorrect ? problem.correct : undefined,
        visibility: includeCorrect ? problem.visibility : undefined,
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
    const [
      { num },
      session,
      { description, rank, initial, correct, visibility, teamSlug },
    ] = await Promise.all([params, getServerSession(authOptions), req.json()]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (rank === undefined || rank === null || !initial || !correct) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    if (visibility) {
      if (
        !Object.values(Visibility).includes(visibility) ||
        visibility === Visibility.DELETED
      ) {
        return NextResponse.json(
          { message: "Invalid visibility" },
          { status: 400 },
        );
      }

      if (visibility === Visibility.TEAM && !teamSlug) {
        return NextResponse.json(
          { message: "Team is required to create a team visibility problem" },
          { status: 400 },
        );
      }
    }

    // Fetch the problem to verify ownership
    const existingProblem = await db.problem.findUnique({
      where: { num },
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
      where: { num },
      data: {
        description,
        visibility,
        rank,
        initial,
        correct,
      },
    });

    // If the problem is team-based and a teamId is provided, create a join record
    if (visibility === Visibility.TEAM && teamSlug) {
      const team = await db.team.findUnique({
        where: { slug: teamSlug },
      });
      if (!team) {
        return NextResponse.json(
          { message: "Team not found" },
          { status: 404 },
        );
      }
      await db.teamProblem.create({
        data: {
          teamSlug,
          problemNum: num,
        },
      });
    }

    return NextResponse.json({ num }, { status: 200 });
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
    const [{ num }, session] = await Promise.all([
      params,
      getServerSession(authOptions),
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingProblem = await db.problem.findUnique({
      where: { num },
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
      where: { num },
      data: {
        visibility: Visibility.DELETED,
      },
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
