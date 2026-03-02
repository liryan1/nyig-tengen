import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/authOptions";
import {
  getProblemSelect,
  getProblemSelectOR,
  mapProblemResponse,
} from "./problemQuery";

const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "20";

type QueryParams = {
  page?: string;
  limit?: string;
  rank_min?: string;
  rank_max?: string;
  creatorId?: string;
  sort?: string;
  starred?: string;
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
      ...(params.starred === "true" && userId
        ? {
            problemStars: {
              some: {
                userId,
              },
            },
          }
        : {}),
    };

    if (params.creatorId) {
      where.authorId = params.creatorId;
    }

    const orderBy: Prisma.ProblemOrderByWithRelationInput[] = [];
    if (params.sort === "likes") {
      orderBy.push({ problemLikes: { _count: "desc" } });
    } else if (params.sort === "views") {
      orderBy.push({ problemStats: { views: "desc" } });
    }
    orderBy.push({ createdAt: "desc" });

    // Fetch the problem sets with pagination and get count
    const [totalProblems, problems] = await db.$transaction([
      db.problem.count({
        where,
      }),
      db.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
