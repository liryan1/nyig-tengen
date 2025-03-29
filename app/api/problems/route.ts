import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/authOptions";
import {
  validateProblemInitial,
  validateProblemSolutions,
} from "@/lib/go/validator";
import { Prisma, Visibility } from "@prisma/client";
import {
  getProblemSelect,
  getProblemSelectOR,
  mapProblemResponse,
} from "./problemQuery";
import { isUserAdmin } from "@/lib/utils";

const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "20";

type QueryParams = {
  page?: string;
  limit?: string;
  rank_min?: string;
  rank_max?: string;
  creator?: string;
  sort?: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const params: QueryParams = Object.fromEntries(searchParams.entries());

    // If logged in, fetch problem submissions
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Default pagination settings
    const page = parseInt(params.page || DEFAULT_PAGE, 10);
    const limit = parseInt(params.limit || DEFAULT_LIMIT, 10);
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json(
        { message: "Invalid page or limit" },
        { status: 400 },
      );
    }
    const skip = (page - 1) * limit;

    const lte = parseInt(params.rank_max || "8", 10);
    const gte = parseInt(params.rank_min || "-30", 10);
    // rank range must be valid ranks and overlapping
    if (
      isNaN(lte) ||
      isNaN(gte) ||
      lte < -30 ||
      lte > 8 ||
      gte < -30 ||
      gte > 8 ||
      lte < gte
    ) {
      return NextResponse.json(
        { message: "Invalid rank range" },
        { status: 400 },
      );
    }

    const where: Prisma.ProblemWhereInput = {
      rank: { gte, lte },
      OR: getProblemSelectOR(userId),
    };

    if (params.creator) {
      where.author = {
        name: params.creator,
      };
    }

    const orderBy: Prisma.ProblemOrderByWithRelationInput[] = [
      { createdAt: "desc" },
    ];
    if (params.sort === "likes") {
      orderBy.push({ problemLikes: { _count: "desc" } });
    } else if (params.sort === "views") {
      orderBy.push({ problemStats: { views: "desc" } });
    }

    // Fetch the problem sets with pagination and get count
    const [totalProblems, problems] = await db.$transaction([
      db.problem.count({
        where,
      }),
      db.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy.toReversed(),
        select: getProblemSelect(userId),
      }),
    ]);

    return NextResponse.json(
      {
        currentPage: page,
        limit,
        totalPages: Math.ceil(totalProblems / limit),
        totalProblems,
        problems: problems.map((problem) =>
          mapProblemResponse(problem, userId),
        ),
      },
      { status: 200 },
    );
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    // Get session and request payload (including optional teamId)
    const [session, payload] = await Promise.all([
      getServerSession(authOptions),
      req.json(),
    ]);
    const { description, rank, initial, correct, visibility, teamSlugs } =
      payload;
    const userId = session?.user?.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!isUserAdmin(session)) {
      return new NextResponse("Forbidden", { status: 403 });
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

      if (visibility === Visibility.TEAM && !teamSlugs?.length) {
        return NextResponse.json(
          { message: "Team is required to create a team visibility problem" },
          { status: 400 },
        );
      }
    }
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
    const createRequests = [];
    if (visibility === Visibility.TEAM && teamSlugs) {
      for (const teamSlug of teamSlugs) {
        createRequests.push(
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
    await db.$transaction(createRequests);

    return NextResponse.json({ num: createdProblem.num }, { status: 201 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred while creating the problem" },
      { status: 500 },
    );
  }
}
