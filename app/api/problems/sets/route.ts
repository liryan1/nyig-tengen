import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";

const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "20";

type QueryParams = {
  page?: string;
  limit?: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const params: QueryParams = Object.fromEntries(searchParams.entries());

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

    // Fetch the problem sets with pagination and get count
    const [totalProblemSets, problemSets] = await db.$transaction([
      db.problemSet.count(),
      db.problemSet.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // Most recent first
        select: {
          id: true,
          name: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          description: true,
          problemCount: true,
          averageRank: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json(
      {
        currentPage: page,
        limit,
        totalPages: Math.ceil(totalProblemSets / limit),
        totalProblemSets,
        problemSets,
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
    const [session, { name, description, problems }] = await Promise.all([
      getServerSession(authOptions),
      req.json(),
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }
    const problemSet = await db.problemSet.create({
      data: {
        name,
        description,
        authorId: userId,
      },
    });

    const problemSetId = problemSet.id;
    let position = 1; // To track the position in the problem set

    const promises: Promise<number>[] = [];
    for (const problem of problems) {
      promises.push(
        createOrGetProblem(problem, problemSetId, position++, userId),
      );
    }

    const ranks = await Promise.all(promises);

    const problemCount = promises.length;
    const averageRank =
      problemCount > 0
        ? ranks.reduce((sum, rank) => sum + rank, 0) / problemCount
        : 0;

    await db.problemSet.update({
      where: { id: problemSetId },
      data: { problemCount, averageRank },
    });

    return NextResponse.json({
      message: "Problem set created successfully",
      problemSetId,
    });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}

async function createOrGetProblem(
  problem: string | any,
  problemSetId: string,
  position: number,
  userId: string,
): Promise<number> {
  if (typeof problem === "string") {
    const existingProblem = await db.problem.findUnique({
      where: { id: problem },
    });

    if (!existingProblem) {
      logStack(`Problem ID ${problem} not found`);
      throw Error(`Problem ID ${problem} not found`);
    }

    await db.problemSetProblem.create({
      data: {
        problemSetId,
        problemId: problem,
        position,
      },
    });

    return existingProblem.rank;
  } else {
    const newProblem = await db.problem.create({
      data: {
        ...problem,
        authorId: userId,
      },
    });

    await db.problemSetProblem.create({
      data: {
        problemSetId,
        problemId: newProblem.id,
        position,
      },
    });

    return newProblem.rank;
  }
}
