import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };
const psetProgressSelect: Prisma.ProblemSetProgressSelect = {
  id: true,
  createdAt: true,
  status: true,
  problemOrder: true,
  problemSet: { select: { name: true, id: true } },
};

export async function GET(req: Request, { params }: Params) {
  try {
    const [{ id }, session] = await Promise.all([
      params,
      getServerSession(authOptions),
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const progresses = await db.problemSetProgress.findMany({
      where: {
        userId,
        problemSetId: id,
      },
      orderBy: { createdAt: "desc" },
      select: psetProgressSelect,
    });

    const progress = progresses.find((p) => p.status === "inprogress");
    const completedCount = progresses.filter(
      (p) => p.status === "completed",
    ).length;

    return NextResponse.json({ progress, completedCount }, { status: 200 });
  } catch (error) {
    logStack(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const [{ id }, session, { randomize }] = await Promise.all([
      params,
      getServerSession(authOptions),
      req.json(),
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // If the user has an existing progress, return it
    const existingProgress = await db.problemSetProgress.findFirst({
      where: {
        userId,
        problemSetId: id,
        status: "inprogress",
      },
      select: psetProgressSelect,
    });
    if (existingProgress) {
      return NextResponse.json(existingProgress, { status: 200 });
    }

    // Get the problem set and its default order
    const problemSet = await db.problemSet.findUnique({
      where: { id },
      include: {
        problemSetProblems: {
          select: { problemId: true, position: true },
        },
      },
    });
    if (!problemSet) {
      return NextResponse.json(
        { message: "Problem set not found" },
        { status: 404 },
      );
    }

    // create the problemOrder
    let orderArray = problemSet.problemSetProblems
      .sort((a, b) => a.position - b.position)
      .map((o) => ({ problemId: o.problemId }));
    if (randomize) {
      orderArray = shuffleArray(orderArray);
    }

    // create the progress and return
    const [newProgress, _] = await db.$transaction([
      db.problemSetProgress.create({
        data: {
          userId,
          problemSetId: id,
          status: "inprogress",
          problemOrder: orderArray,
        },
        select: psetProgressSelect,
      }),
      db.problemSetStats.upsert({
        where: { problemSetId: id },
        update: { attempted: { increment: 1 } },
        create: { problemSetId: id, attempted: 1 },
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
