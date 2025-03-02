import { authOptions } from "@/app/api/auth/authOptions";
import { evaluate } from "@/lib/go/evaluate";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { fromSgf } from "@/lib/go/parser";
import { ProgressStatus, SubmissionStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { ALL_PROBLEMS_TAG } from "@/lib/nextTags";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const [{ id }, session, { userMoves, problemSetProgressId }] =
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
      where: { id },
      select: {
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

    if (evaluation.status === "solved") {
      revalidateTag(ALL_PROBLEMS_TAG);
    }

    // Creates the update data for the problem set progress saved in problemOrder
    // If all problems are completed, set the status
    let updateProgressData: any = { updatedAt: new Date() };
    let updateProblemSetStats: any;
    let problemSetCompleted: string | undefined = undefined;
    if (problemSetProgressId) {
      const progress = await db.problemSetProgress.findUnique({
        where: { id: problemSetProgressId },
        select: {
          problemSetId: true,
          problemOrder: true,
        },
      });
      if (!progress) {
        return NextResponse.json(
          { message: "Progress not found" },
          { status: 400 },
        );
      }
      const problemOrder = ((progress?.problemOrder ?? []) as any[]).map(
        (p: { problemId: string; status: SubmissionStatus }) => {
          if (p.problemId === id && p.status !== "solved") {
            p.status = evaluation.status;
          }
          return p;
        },
      );
      updateProgressData["problemOrder"] = problemOrder;
      if (problemOrder.every((p) => p.status === "solved")) {
        problemSetCompleted = progress.problemSetId;
        updateProgressData["status"] = ProgressStatus.completed;
        updateProblemSetStats = {
          data: { completed: { increment: 1 } },
          where: { problemSetId: progress.problemSetId },
        };
      }
    }

    // Update the problem and save the submission
    await db.$transaction([
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
      db.problemStats.upsert({
        where: { problemId: id },
        update: {
          ...stats,
        },
        create: {
          problemId: id,
          views: 1,
          submissionCount: 1,
          correctCount: evaluation.status === "solved" ? 1 : 0,
        },
      }),
      db.submission.create({
        data: {
          userId,
          problemId: id,
          problemSetProgressId,
          userMoves,
          status: evaluation.status,
          mismatchIndex: evaluation.mismatchIndex,
          correctOpponentMove: evaluation.correctOpponentMove,
        },
      }),
    ]);

    return NextResponse.json(
      { evaluation, problemSetCompleted },
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
