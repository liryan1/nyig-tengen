import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/authOptions";

const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "50";

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
    const [totalProblems, problems] = await db.$transaction([
      db.problem.count(),
      db.problem.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
              likes: true,
              submissionCount: true,
              correctCount: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        currentPage: page,
        limit,
        totalPages: Math.ceil(totalProblems / limit),
        totalProblems,
        problems: problems.map((problem) => ({
          id: problem.id,
          initial: problem.initial,
          rank: problem.rank,
          description: problem.description,
          author: problem.author,
          stats: problem.problemStats,
        })),
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
    const [session, { title, description, rank, initial, correct, incorrect }] =
      await Promise.all([getServerSession(authOptions), req.json()]);
    const userId = session?.user?.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!title || !rank || !initial || !correct) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    await db.problem.create({
      data: {
        description,
        rank,
        initial,
        correct,
        authorId: userId,
      },
    });

    return NextResponse.json(
      { message: "Problem created successfully" },
      { status: 201 },
    );
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred while creating the problem" },
      { status: 500 },
    );
  }
}
