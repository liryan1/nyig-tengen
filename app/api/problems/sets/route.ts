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

    const team = searchParams.get("team");
    const andConditions: Prisma.ProblemSetWhereInput[] = [];

    if (team && team !== "public") {
      if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const membership = await db.teamMembership.findUnique({
        where: { userId_teamSlug: { userId, teamSlug: team } },
      });
      if (!membership) {
        return NextResponse.json(
          { message: "You are not a member of this team" },
          { status: 403 },
        );
      }
      // OPTIMIZATION: Manually fetch problem set numbers for the team to avoid slow relation joins in MongoDB
      const teamProblemSets = await db.teamProblemSet.findMany({
        where: { teamSlug: team },
        select: { problemSetNum: true },
      });
      const psetNums = teamProblemSets.map((tps) => tps.problemSetNum);
      andConditions.push({ num: { in: psetNums } });
    } else {
      const orConditions: Prisma.ProblemSetWhereInput[] = [
        { visibility: Visibility.PUBLIC },
      ];
      if (userId) {
        orConditions.push({
          authorId: userId,
          visibility: Visibility.PRIVATE,
        });
      }
      andConditions.push({ OR: orConditions });
    }

    const where: Prisma.ProblemSetWhereInput = {
      AND: andConditions,
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
    const [userLikes, userStars, userProgress] = await Promise.all([
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
      userId
        ? db.problemSetProgress.findMany({
            where: {
              userId,
              status: "inprogress",
              problemSetNum: { in: psetNums },
            },
            select: { id: true, problemOrder: true, problemSetNum: true },
          })
        : [],
    ]);

    const likedNums = new Set(userLikes.map((l) => l.problemSetNum));
    const starredNums = new Set(userStars.map((s) => s.problemSetNum));
    const progressMap = new Map(userProgress.map((p) => [p.problemSetNum, p]));

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
            progressMap.get(pset.num),
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
