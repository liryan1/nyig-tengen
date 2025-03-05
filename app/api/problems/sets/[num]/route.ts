import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { ProgressStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ num: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const [session, { num }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    const userId = session?.user?.id;
    const problemSet = await db.problemSet.findUnique({
      where: { num },
      select: {
        name: true,
        description: true,
        problemCount: true,
        averageRank: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
        problemSetProblems: {
          select: { problem: true, position: true },
        },
        problemSetStats: true,
        problemSetLikes: {
          select: {
            userId: true,
          },
        },
        problemSetProgresses: userId
          ? {
              where: {
                userId,
                OR: [
                  { status: ProgressStatus.inprogress },
                  { status: ProgressStatus.completed },
                ],
              },
              select: {
                id: true,
                problemOrder: true,
                status: true,
              },
            }
          : false,
      },
    });

    if (!problemSet) {
      return NextResponse.json("Problem set not found", { status: 404 });
    }

    const problems = problemSet.problemSetProblems.map((psp) => ({
      num: psp.problem.num,
      rank: psp.problem.rank,
      initial: psp.problem.initial,
      position: psp.position,
    }));

    problems.sort((a, b) => a.position - b.position);
    const userLiked = problemSet.problemSetLikes.some(
      (like) => like.userId === userId,
    );

    const userProgress = problemSet.problemSetProgresses?.find(
      (psp) => psp.status === "inprogress",
    );
    const userCompletions = problemSet.problemSetProgresses?.filter(
      (psp) => psp.status === "completed",
    )?.length;

    return NextResponse.json(
      {
        num,
        name: problemSet.name,
        description: problemSet.description,
        problemCount: problemSet.problemCount,
        averageRank: problemSet.averageRank,
        completedCount: problemSet.problemSetStats?.completed,
        attemptedCount: problemSet.problemSetStats?.attempted,
        views: problemSet.problemSetStats?.views,
        likes: problemSet.problemSetLikes.length,
        userLiked,
        author: problemSet.author,
        problems,
        userProgress,
        userCompletions,
        createdAt: problemSet.createdAt,
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

// /**
//  * Updates the list problemIds in the order they appear.
//  * Deletes old lost ProblemSetProblem entries and creates new ones.
//  * Recalculates problemCount and averageRank
//  */
// export async function PATCH(req: Request, { params }: Params) {
//   const [{ id }, { name, description, problems }] = await Promise.all([
//     params,
//     req.json(),
//   ]);
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user) {
//       return NextResponse.json("Not authorized", { status: 401 });
//     }

//     const existingProblemSet = await db.problemSet.findUnique({
//       where: { id },
//     });

//     if (!existingProblemSet) {
//       return NextResponse.json("Problem set not found", { status: 404 });
//     }
//     if (existingProblemSet.authorId !== session.user.id) {
//       return NextResponse.json("Not authorized", { status: 403 });
//     }

//     const problemSetProblems = problems.map(
//       (problemId: string, index: number) => ({
//         problemSetId: id,
//         problemId,
//         position: index + 1,
//       }),
//     );

//     // Upsert ProblemSetProblem entries and remove old ones not in the new list
//     await db.$transaction([
//       db.problemSetProblem.deleteMany({ where: { problemSetId: id } }),
//       db.problemSetProblem.createMany({ data: problemSetProblems }),
//     ]);

//     // Recalculate problemCount and averageRank
//     const updatedProblems = await db.problemSetProblem.findMany({
//       where: { problemSetId: id },
//       include: { problem: true },
//     });

//     const problemCount = updatedProblems.length;
//     const averageRank =
//       updatedProblems.reduce((sum, p) => sum + p.problem.rank, 0) /
//       (problemCount || 1);

//     await db.problemSet.update({
//       where: { id },
//       data: {
//         name,
//         description,
//         problemCount,
//         averageRank,
//       },
//     });

//     return NextResponse.json(
//       { message: "Successful updated problem set" },
//       { status: 200 },
//     );
//   } catch (error) {
//     logStack(error);
//     return NextResponse.json(
//       { message: "An unknown error occurred" },
//       { status: 500 },
//     );
//   }
// }
