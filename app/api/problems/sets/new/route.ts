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
import { Visibility } from "@prisma/client";
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
    if (body.visibility) {
      if (
        !Object.values(Visibility).includes(body.visibility) ||
        body.visibility === Visibility.DELETED
      ) {
        return NextResponse.json(
          { message: "Invalid visibility" },
          { status: 400 },
        );
      }

      if (body.visibility === Visibility.TEAM && !body.teamSlugs?.length) {
        return NextResponse.json(
          {
            message: "Team is required to create a team visibility problem set",
          },
          { status: 400 },
        );
      }
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
  const { name, description, sgf, visibility, teamSlugs } = body;

  const parsed = fromSgf(sgf);
  const boardSize = getBoardSize(sgf);
  const problemSgfs = parsed.children.map((c) => toSgf(c, boardSize));

  const problemInputs = problemSgfs.map((sgf, i) => {
    const goGame = GoGame.fromSgf(sgf);
    const initial = rootNodeToSgf(goGame);
    const correct = goGameToSgf(goGame);
    const info = getProblemInfoFromComments(goGame.root.comment);
    const rank = parseRank(info.rank, -10);

    return {
      initial,
      correct,
      rank,
      description: `${name} problem ${i + 1}: ${info?.description}`,
    };
  });

  const problemCount = problemInputs.length;
  const rankSum = problemInputs.reduce((sum, p) => sum + p.rank, 0);
  const averageRank = rankSum / problemCount;

  return db.$transaction(
    async (tx) => {
      // Get next ProblemSet num
      const setCounter = await tx.counter.upsert({
        where: { model: "ProblemSet" },
        update: { value: { increment: 1 } },
        create: { model: "ProblemSet", value: 1 },
      });
      const problemSetNum = setCounter.value.toString();

      // Batch increment Problem counter
      const counterDoc = await tx.counter.upsert({
        where: { model: "Problem" },
        update: { value: { increment: problemCount } },
        create: { model: "Problem", value: problemCount },
      });

      const startingNum = counterDoc.value - problemCount + 1;

      const problemCreations = problemInputs.map(async (data, i) => {
        const problemNum = (startingNum + i).toString();

        const created = await tx.problem.create({
          data: {
            num: problemNum,
            ...data,
            authorId: userId,
            visibility,
          },
          select: { id: true, num: true },
        });

        // Create teamProblem links if visibility is TEAM
        if (visibility === Visibility.TEAM && teamSlugs) {
          await Promise.all(
            teamSlugs.map((slug) =>
              tx.teamProblem.create({
                data: {
                  teamSlug: slug,
                  problemNum: created.num,
                },
              }),
            ),
          );
        }

        // Link to problem set
        await tx.problemSetProblem.create({
          data: {
            problemSetNum,
            problemNum: created.num,
            position: i + 1,
          },
        });

        return created;
      });

      await Promise.all(problemCreations);

      // Create the problem set
      await tx.problemSet.create({
        data: {
          num: problemSetNum,
          name,
          description,
          authorId: userId,
          averageRank,
          problemCount,
          visibility,
        },
      });

      // Link to teams if needed
      if (visibility === Visibility.TEAM && teamSlugs) {
        await Promise.all(
          teamSlugs.map((slug) =>
            tx.teamProblemSet.create({
              data: {
                teamSlug: slug,
                problemSetNum,
              },
            }),
          ),
        );
      }

      return problemSetNum;
    },
    {
      timeout: 60_000, // 60 seconds
    },
  );
}
