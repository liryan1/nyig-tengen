import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { evaluate } from "@/lib/go/evaluate";
import { fromSgf } from "@/lib/go/parser";
import { ProgressStatus, SubmissionStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ num: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const [{ num }, session, { userMoves, problemSetProgressId }] =
      await Promise.all([params, getServerSession(authOptions), req.json()]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    if (!Array.isArray(userMoves)) {
      return NextResponse.json(
        { message: "Invalid submission data" },
        { status: 400 },
      );
    }

    // Fetch the problem and its solutions
    const problem = await db.problem.findUnique({
      where: { num },
      select: {
        num: true,
        correct: true,
      },
    });

    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 },
      );
    }

    const root = fromSgf(problem.correct);
    const { evaluation, stats } = evaluate(userMoves, root);

    // Creates the update data for the problem set progress saved in problemOrder
    // If all problems are completed, set the status
    let updateProgressData: any = { updatedAt: new Date() };
    let updateProblemSetStats: any;
    let updateProblemSetLeaderboard: any;
    let problemSetCompleted: boolean | undefined = undefined;
    let problemSetNum: string | undefined = undefined;
    if (problemSetProgressId) {
      const progress = await db.problemSetProgress.findUnique({
        where: { id: problemSetProgressId },
        select: {
          problemSetNum: true,
          problemOrder: true,
          createdAt: true,
        },
      });
      if (!progress) {
        return NextResponse.json(
          { message: "Progress not found" },
          { status: 400 },
        );
      }
      problemSetNum = progress.problemSetNum;
      const problemOrder = ((progress?.problemOrder ?? []) as any[]).map(
        (p: { problemNum: string; status: SubmissionStatus }) => {
          if (p.problemNum === num && p.status !== "solved") {
            p.status = evaluation.status;
          }
          return p;
        },
      );
      updateProgressData["problemOrder"] = problemOrder;
      if (problemOrder.every((p) => p.status === "solved")) {
        problemSetCompleted = true;
        updateProgressData["status"] = ProgressStatus.completed;
        updateProblemSetStats = {
          data: { completed: { increment: 1 } },
          where: { problemSetNum: progress.problemSetNum },
        };

        // Leaderboard calculations
        const mismatches = await db.submission.findMany({
          where: { problemSetProgressId, status: SubmissionStatus.mismatch },
          select: { problemNum: true },
        });
        const score = calculateScore(problemOrder.length, mismatches);
        updateProblemSetLeaderboard = {
          where: {
            problemSetNum_userId: {
              problemSetNum: progress.problemSetNum,
              userId,
            },
          },
          create: {
            problemSetNum: progress.problemSetNum,
            userId,
            durationMs:
              updateProgressData.updatedAt.getTime() -
              progress.createdAt.getTime(),
            startedAt: progress.createdAt,
            completedAt: updateProgressData.updatedAt,
            completionCount: 1,
            score,
          },
          update: {
            durationMs:
              updateProgressData.updatedAt.getTime() -
              progress.createdAt.getTime(),
            startedAt: progress.createdAt,
            completedAt: updateProgressData.updatedAt,
            completionCount: { increment: 1 },
            score,
          },
        };
      }
    }

    // Update the problem and save the submission
    await db.$transaction([
      // Update problem set properties if the user completed the final problem
      ...(problemSetProgressId
        ? [
            db.problemSetProgress.update({
              where: { id: problemSetProgressId },
              data: updateProgressData,
            }),
          ]
        : []),
      ...(updateProblemSetStats?.data
        ? [db.problemSetStats.update(updateProblemSetStats)]
        : []),
      ...(updateProblemSetLeaderboard
        ? [db.problemSetLeaderboardEntry.upsert(updateProblemSetLeaderboard)]
        : []),

      db.problemStats.upsert({
        where: { problemNum: problem.num },
        update: {
          ...stats,
        },
        create: {
          problemNum: problem.num,
          views: 1,
          submissionCount: 1,
          correctCount: evaluation.status === "solved" ? 1 : 0,
        },
      }),
      db.submission.create({
        data: {
          userId,
          problemNum: problem.num,
          problemSetProgressId,
          userMoves,
          status: evaluation.status,
          mismatchIndex: evaluation.mismatchIndex,
          correctOpponentMove: evaluation.correctOpponentMove,
        },
      }),
    ]);

    return NextResponse.json(
      { evaluation, problemSetCompleted, problemSetNum },
      { status: 201 },
    );
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred during submission" },
      { status: 500 },
    );
  }
}

/**
 * Problem Set score based on how many mismatches observed per problem
 * minus 25 points for each mismatch count, max 50 points deducted per problem
 */
function calculateScore(
  problemCount: number,
  mismatches: { problemNum: string }[],
) {
  const mismatchesByProblem: Record<string, number> = {};
  mismatches.forEach((submission) => {
    mismatchesByProblem[submission.problemNum] =
      (mismatchesByProblem[submission.problemNum] ?? 0) + 1;
  });

  let score = problemCount * 100;
  Object.values(mismatchesByProblem).forEach((mismatches) => {
    score -= Math.min(50, mismatches * 25);
  });

  return score;
}
