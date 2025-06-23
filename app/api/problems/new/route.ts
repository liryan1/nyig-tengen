import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import {
  validateProblemInitial,
  validateProblemSolutions,
} from "@/lib/go/validator";
import { isUserAdmin } from "@/lib/utils";
import { Visibility } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";
import { GoGame } from "@/lib/go/goGame";
import { goGameToSgf, rootNodeToSgf } from "@/lib/go/parser";

export async function POST(req: Request) {
  try {
    // Get session and request payload (including optional teamId)
    const [session, payload] = await Promise.all([
      getServerSession(authOptions),
      req.json(),
    ]);
    const { description, rank, sgf, visibility, teamSlugs } = payload;
    const userId = session?.user?.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!isUserAdmin(session)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    if (rank === undefined || rank === null || !sgf) {
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

      if (visibility === Visibility.TEAM && !teamSlugs?.length) {
        return NextResponse.json(
          { message: "Team is required to create a team visibility problem" },
          { status: 400 },
        );
      }
    }
    const goGame = GoGame.fromSgf(sgf);
    const initial = rootNodeToSgf(goGame);
    const correct = goGameToSgf(goGame);
    // Validate initial and correct fields
    try {
      validateProblemInitial(initial);
      validateProblemSolutions(correct);
    } catch (error) {
      return NextResponse.json(
        { message: `Invalid problem in request. Error: ${error}` },
        { status: 400 },
      );
    }
    // Atomically increment the problem counter
    const counter = await db.counter.upsert({
      where: { model: "Problem" },
      update: { value: { increment: 1 } },
      create: { model: "Problem", value: 1 },
    });
    // Create the problem; select both id and num so we can use id in join table creation
    const createdProblem = await db.problem.create({
      data: {
        num: counter.value.toString(),
        description,
        rank,
        initial,
        correct,
        authorId: userId,
        visibility,
      },
      select: { id: true, num: true },
    });

    // If the problem is team-based and a list of teams is provided, create join records
    const teamProblemCreateRequests = [];
    if (visibility === Visibility.TEAM && teamSlugs) {
      for (const teamSlug of teamSlugs) {
        teamProblemCreateRequests.push(
          db.teamProblem.create({
            data: {
              teamSlug,
              problemNum: createdProblem.num,
            },
          }),
        );
      }
    }

    // Fail whole batch if one fails
    await db.$transaction(teamProblemCreateRequests);

    return NextResponse.json({ num: createdProblem.num }, { status: 201 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred while creating the problem" },
      { status: 500 },
    );
  }
}
