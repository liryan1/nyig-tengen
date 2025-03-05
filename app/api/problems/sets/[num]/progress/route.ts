import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { Prisma, ProgressStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ num: string }> };
const psetProgressSelect: Prisma.ProblemSetProgressSelect = {
  id: true,
  createdAt: true,
  status: true,
  problemOrder: true,
  problemSet: { select: { name: true, num: true } },
};

export async function GET(req: Request, { params }: Params) {
  try {
    const [{ num }, session] = await Promise.all([
      params,
      getServerSession(authOptions),
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const progress = await db.problemSetProgress.findFirst({
      where: {
        userId,
        problemSetNum: num,
        status: ProgressStatus.inprogress,
      },
      select: psetProgressSelect,
    });

    return NextResponse.json(progress, { status: 200 });
  } catch (error) {
    logStack(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const [{ num }, session, { randomize }] = await Promise.all([
      params,
      getServerSession(authOptions),
      req.json(),
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the problem set and its default problem order
    const problemSet = await db.problemSet.findUnique({
      where: { num },
      select: {
        id: true,
        problemSetProblems: {
          select: { problemNum: true, position: true },
        },
      },
    });
    if (!problemSet) {
      return NextResponse.json(
        { message: "Problem set not found" },
        { status: 404 },
      );
    }

    // If the user has an existing progress, return it
    const existingProgress = await db.problemSetProgress.findFirst({
      where: {
        userId,
        problemSetNum: num,
        status: "inprogress",
      },
      select: psetProgressSelect,
    });
    if (existingProgress) {
      return NextResponse.json(existingProgress, { status: 200 });
    }

    // create the problemOrder
    let orderArray = problemSet.problemSetProblems
      .sort((a, b) => a.position - b.position)
      .map((o) => ({ problemNum: o.problemNum }));
    if (randomize) {
      orderArray = shuffleArray(orderArray);
    }

    // create the progress and return
    const [newProgress, _] = await db.$transaction([
      db.problemSetProgress.create({
        data: {
          userId,
          problemSetNum: num,
          status: "inprogress",
          problemOrder: orderArray,
        },
        select: psetProgressSelect,
      }),
      db.problemSetStats.upsert({
        where: { problemSetNum: num },
        update: { attempted: { increment: 1 } },
        create: { problemSetNum: num, attempted: 1 },
      }),
    ]);

    return NextResponse.json(newProgress, { status: 201 });
  } catch (error) {
    logStack(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}
