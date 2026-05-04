import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { Prisma, Visibility } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/authOptions";
import { getProblemSelect, mapProblemResponse } from "./problemQuery";

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

    let teamSlugs: string[] = [];
    if (userId) {
      const memberships = await db.teamMembership.findMany({
        where: { userId },
        select: { teamSlug: true },
      });
      teamSlugs = memberships.map((m) => m.teamSlug);
    }

    const isStarred = searchParams.get("starred") === "true";

    const andConditions: Prisma.ProblemWhereInput[] = [{ rank: { gte, lte } }];

    if (isStarred) {
      if (!userId) {
        return NextResponse.json(
          {
            currentPage: page,
            limit,
            totalPages: 0,
            totalProblems: 0,
            problems: [],
          },
          { status: 200 },
        );
      }
      const starred = await db.problemStar.findMany({
        where: { userId },
        select: { problemNum: true },
      });
      andConditions.push({ num: { in: starred.map((s) => s.problemNum) } });
    }

    const orConditions: Prisma.ProblemWhereInput[] = [
      { visibility: Visibility.PUBLIC },
    ];
    if (userId) {
      orConditions.push({ authorId: userId });
    }
    if (teamSlugs.length > 0) {
      orConditions.push({
        teamProblems: {
          some: {
            teamSlug: {
              in: teamSlugs,
            },
          },
        },
      });
    }
    andConditions.push({ OR: orConditions });

    if (params.creatorId) {
      andConditions.push({ authorId: params.creatorId });
    }

    const where: Prisma.ProblemWhereInput = {
      AND: andConditions,
    };

    const orderBy: Prisma.ProblemOrderByWithRelationInput[] = [];
    if (params.sort === "likes") {
      orderBy.push({ problemStats: { likes: "desc" } });
    } else if (params.sort === "views") {
      orderBy.push({ problemStats: { views: "desc" } });
    }
    orderBy.push({ createdAt: "desc" });

    // Fetch the problems with pagination and get count
    const [totalProblems, problems] = await Promise.all([
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

    const problemNums = problems.map((p) => p.num);
    const [userLikes, userStars, userSolved] = await Promise.all([
      userId
        ? db.problemLike.findMany({
            where: { userId, problemNum: { in: problemNums } },
            select: { problemNum: true },
          })
        : [],
      userId
        ? db.problemStar.findMany({
            where: { userId, problemNum: { in: problemNums } },
            select: { problemNum: true },
          })
        : [],
      userId
        ? db.submission.findMany({
            where: {
              userId,
              problemNum: { in: problemNums },
              status: "solved",
            },
            select: { problemNum: true },
          })
        : [],
    ]);

    const likedNums = new Set(userLikes.map((l) => l.problemNum));
    const starredNums = new Set(userStars.map((s) => s.problemNum));
    const solvedNums = new Set(userSolved.map((s) => s.problemNum));

    return NextResponse.json(
      {
        currentPage: page,
        limit,
        totalPages: Math.ceil(totalProblems / limit),
        totalProblems,
        problems: problems.map((problem) =>
          mapProblemResponse(
            problem,
            userId,
            likedNums.has(problem.num),
            starredNums.has(problem.num),
            solvedNums.has(problem.num),
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
