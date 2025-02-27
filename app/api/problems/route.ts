import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/authOptions";
import {
  validateProblemInitial,
  validateProblemSolutions,
} from "@/lib/go/validator";
import { Prisma } from "@prisma/client";

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
      db.problem.count(),
      db.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy.toReversed(),
        select: {
          id: true,
          description: true,
          initial: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          rank: true,
          problemStats: {
            select: {
              id: true,
              views: true,
              submissionCount: true,
              correctCount: true,
            },
          },
          problemLikes: {
            select: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
          // If the user is logged in, fetch the first solved submission
          submissions: userId
            ? {
                where: {
                  userId,
                  status: "solved",
                },
                select: {
                  status: true,
                },
                take: 1,
              }
            : false,
        },
      }),
    ]);

    const normalizedProblems = problems.map((problem) => {
      const userLiked =
        problem.problemLikes.findIndex((p) => p.user.id === userId) !== -1;
      return {
        id: problem.id,
        initial: problem.initial,
        rank: problem.rank,
        description: problem.description,
        author: problem.author,
        userSolved: problem.submissions?.at(0)?.status === "solved",
        stats: {
          ...problem.problemStats,
          userLiked,
          likes: problem.problemLikes.length,
        },
      };
    });

    return NextResponse.json(
      {
        currentPage: page,
        limit,
        totalPages: Math.ceil(totalProblems / limit),
        totalProblems,
        problems: normalizedProblems,
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
    const [session, { description, rank, initial, correct }] =
      await Promise.all([getServerSession(authOptions), req.json()]);
    const userId = session?.user?.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (rank === undefined || rank === null || !initial || !correct) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
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

    const createdProblem = await db.problem.create({
      data: {
        description,
        rank,
        initial,
        correct,
        authorId: userId,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json(createdProblem, { status: 201 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred while creating the problem" },
      { status: 500 },
    );
  }
}
