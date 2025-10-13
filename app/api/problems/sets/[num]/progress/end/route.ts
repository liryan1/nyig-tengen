import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { ProgressStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ num: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const [{ num }, session] = await Promise.all([
      params,
      getServerSession(authOptions),
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only one inprogress is allowed at any given time
    const progress = await db.problemSetProgress.findFirst({
      where: {
        userId,
        problemSetNum: num,
        status: ProgressStatus.inprogress,
      },
    });
    if (!progress) {
      return NextResponse.json(
        { message: "No progress found" },
        { status: 404 },
      );
    }

    await db.problemSetProgress.update({
      where: {
        id: progress.id,
        userId,
        problemSetNum: num,
        status: ProgressStatus.inprogress,
      },
      data: {
        status: ProgressStatus.abandoned,
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    logStack(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
