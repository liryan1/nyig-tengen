import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";
import { Visibility } from "@prisma/client";
import {
  getProblemSelect,
  getProblemSelectOR,
  mapProblemResponse,
} from "../problemQuery";
import { GoGame } from "@/lib/go/goGame";
import { goGameToSgf, rootNodeToSgf } from "@/lib/go/parser";
import {
  validateProblemInitial,
  validateProblemSolutions,
} from "@/lib/go/validator";

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
      where: {
        num,
        OR: getProblemSelectOR(userId),
      },
      select: {
        ...getProblemSelect(userId),
        correct: true,
        teamProblems: {
          select: {
            teamSlug: true,
            team: { select: { name: true } },
          },
        },
      },
    });

    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 },
      );
    }

    const [userLike, userStar, userSolved] = await Promise.all([
      userId
        ? db.problemLike.findUnique({
            where: { userId_problemNum: { userId, problemNum: num } },
          })
        : null,
      userId
        ? db.problemStar.findUnique({
            where: { userId_problemNum: { userId, problemNum: num } },
          })
        : null,
      userId
        ? db.submission.findFirst({
            where: { userId, problemNum: num, status: "solved" },
            select: { id: true },
          })
        : null,
    ]);

    const includeCorrect = qParams.isEdit && userId === problem.author.id;

    return NextResponse.json(
      {
        ...mapProblemResponse(
          problem,
          userId,
          !!userLike,
          !!userStar,
          !!userSolved,
        ),
        correct: includeCorrect ? problem.correct : undefined,
        visibility: includeCorrect ? problem.visibility : undefined,
        teams: includeCorrect
          ? problem.teamProblems.map((tp) => ({
              team: tp.team.name,
              slug: tp.teamSlug,
            }))
          : undefined,
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
    const [paramsData, session, body] = await Promise.all([
      params,
      getServerSession(authOptions),
      req.json(),
    ]);
    const { num } = paramsData;
    const {
      description,
      rank,
      sgf,
      visibility,
      teamSlugs, // expecting an array of strings if visibility is TEAM
    } = body;
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
      // For TEAM visibility, require an array of team slugs
      if (visibility === Visibility.TEAM) {
        if (!Array.isArray(teamSlugs) || teamSlugs.length === 0) {
          return NextResponse.json(
            {
              message:
                "At least one team slug is required to create a team visibility problem",
            },
            { status: 400 },
          );
        }
        // Validate that all provided team slugs exist
        const teams = await db.team.findMany({
          where: { slug: { in: teamSlugs } },
          select: { slug: true },
        });
        const foundSlugs = teams.map((team) => team.slug);
        const missingSlugs = teamSlugs.filter(
          (slug: string) => !foundSlugs.includes(slug),
        );
        if (missingSlugs.length > 0) {
          return NextResponse.json(
            { message: `Team(s) not found: ${missingSlugs.join(", ")}` },
            { status: 404 },
          );
        }
      }
    }

    // Fetch the problem to verify ownership and its current visibility
    const existingProblem = await db.problem.findUnique({
      where: { num },
      select: { authorId: true, visibility: true },
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

    await db.$transaction(async (tx) => {
      // Handle TeamProblem records based on visibility change
      if (
        existingProblem.visibility === Visibility.TEAM &&
        visibility !== Visibility.TEAM
      ) {
        // Problem is switching away from TEAM: delete all team associations
        await tx.teamProblem.deleteMany({ where: { problemNum: num } });
      } else if (visibility === Visibility.TEAM) {
        // Problem remains TEAM: reconcile the team associations.
        const existingTeamProblems = await tx.teamProblem.findMany({
          where: { problemNum: num },
          select: { teamSlug: true },
        });
        const existingTeamSlugs = existingTeamProblems.map((tp) => tp.teamSlug);

        // Determine which team associations to create and which to delete
        const slugsToCreate = teamSlugs.filter(
          (slug: string) => !existingTeamSlugs.includes(slug),
        );
        const slugsToDelete = existingTeamSlugs.filter(
          (slug) => !teamSlugs.includes(slug),
        );

        if (slugsToDelete.length) {
          await tx.teamProblem.deleteMany({
            where: {
              problemNum: num,
              teamSlug: { in: slugsToDelete },
            },
          });
        }
        for (const slug of slugsToCreate) {
          await tx.teamProblem.create({
            data: {
              teamSlug: slug,
              problemNum: num,
            },
          });
        }
      }

      // Update the problem record
      await tx.problem.update({
        where: { num },
        data: {
          description,
          visibility,
          rank,
          initial,
          correct,
        },
      });
    });

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
