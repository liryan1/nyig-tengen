import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { parseRank } from "@/lib/go/display";
import { GoGame } from "@/lib/go/goGame";
import {
  fromSgf,
  getBoardSize,
  getProblemInfoFromComments,
  goGameToSgf,
  rootNodeToSgf,
  toSgf,
} from "@/lib/go/parser";
import { CreatePSetRequest } from "@/lib/rtk/slices/problemSets";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const [session, body] = await Promise.all([
      getServerSession(authOptions),
      req.json(),
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const problemSetNum = await createPSet(body, userId);

    return NextResponse.json({
      message: "Problem set created successfully",
      problemSetNum,
    });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}

async function createPSet(body: CreatePSetRequest, userId: string) {
  const { name, description, sgf } = body;

  const parsed = fromSgf(sgf);
  const boardSize = getBoardSize(sgf);
  const problemSgfs = parsed.children.map((c) => toSgf(c, boardSize));

  // Use a transaction to create problem sets, problems and links
  return db.$transaction(async (tx) => {
    const setCounter = await tx.counter.upsert({
      where: { model: "ProblemSet" },
      update: { value: { increment: 1 } },
      create: { model: "ProblemSet", value: 1 },
    });
    const problemSetNum = setCounter.value.toString();

    // Create all problems and join documents
    let rankSum = 0;
    for (let i = 0; i < problemSgfs.length; i++) {
      const goGame = GoGame.fromSgf(problemSgfs[i]);
      const initial = rootNodeToSgf(goGame);
      const correct = goGameToSgf(goGame);
      const problemInfo = getProblemInfoFromComments(goGame.root.comment);
      const rank = parseRank(problemInfo.rank, -10);
      const description = `${name} problem ${i + 1}: ${problemInfo?.description}`;
      rankSum += rank;

      const counter = await tx.counter.upsert({
        where: { model: "Problem" },
        update: { value: { increment: 1 } },
        create: { model: "Problem", value: 1 },
      });
      const problemNum = counter.value.toString();

      const createdProblem = await tx.problem.create({
        data: {
          num: problemNum,
          initial,
          correct,
          description,
          rank,
          authorId: userId,
        },
        select: { id: true, num: true },
      });

      await tx.problemSetProblem.create({
        data: {
          problemSetNum: problemSetNum,
          problemNum: createdProblem.num,
          position: i + 1,
        },
      });
    }

    await tx.problemSet.create({
      data: {
        num: problemSetNum,
        name,
        description,
        authorId: userId,
        averageRank: rankSum / problemSgfs.length,
        problemCount: problemSgfs.length,
      },
    });
  });
}
