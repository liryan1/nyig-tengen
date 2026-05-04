import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";
import { getProblemSetSelect, mapProblemSetResponse } from "../problemSetQuery";
import { Prisma, Visibility } from "@prisma/client";

const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "10";

type QueryParams = {
  page?: string;
  limit?: string;
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
    const where: Prisma.ProblemSetWhereInput = {
      OR: [
        { visibility: Visibility.PUBLIC },
        {
          authorId: userId,
        },
        {
          teamProblemSets: {
            some: {
              team: {
                memberships: {
                  some: {
                    userId: userId,
                  },
                },
              },
            },
          },
        },
      ],
    };

    // Fetch the problem sets with pagination and get count
    const [totalProblemSets, problemSets] = await Promise.all([
      db.problemSet.count({ where }),
      db.problemSet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: getProblemSetSelect(userId),
      }),
    ]);

    const psetNums = problemSets.map((p) => p.num);
    const [userLikes, userStars] = await Promise.all([
      userId
        ? db.problemSetLike.findMany({
            where: { userId, problemSetNum: { in: psetNums } },
            select: { problemSetNum: true },
          })
        : [],
      userId
        ? db.problemSetStar.findMany({
            where: { userId, problemSetNum: { in: psetNums } },
            select: { problemSetNum: true },
          })
        : [],
    ]);

    const likedNums = new Set(userLikes.map((l) => l.problemSetNum));
    const starredNums = new Set(userStars.map((s) => s.problemSetNum));

    return NextResponse.json(
      {
        currentPage: page,
        limit,
        totalPages: Math.ceil(totalProblemSets / limit),
        totalProblemSets,
        problemSets: problemSets.map((pset) =>
          mapProblemSetResponse(
            pset,
            userId,
            likedNums.has(pset.num),
            starredNums.has(pset.num),
          ),
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
