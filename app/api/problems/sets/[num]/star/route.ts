import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";

type Params = { params: Promise<{ num: string }> };
/**
 * - If the user has not starred the target yet, create a new star.
 * - If the user already starred it, remove the existing star.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const [session, { num }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    const userId = session?.user.id;
    if (!userId) return NextResponse.json("Unauthorized", { status: 401 });
    if (!num) {
      return NextResponse.json(
        { message: "problem set ID is required" },
        { status: 400 },
      );
    }

    const existingStar = await db.problemSetStar.findFirst({
      where: {
        userId: session.user.id,
        problemSetNum: num,
      },
      select: { id: true },
    });

    if (existingStar) {
      // Already starred => remove the star
      await db.$transaction([
        db.problemSetStar.delete({ where: { id: existingStar.id } }),
        db.problemSetStats.update({
          where: { problemSetNum: num },
          data: { stars: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ starred: false }, { status: 200 });
    } else {
      // Not starred yet => create the star
      await db.$transaction([
        db.problemSetStar.create({
          data: {
            userId: session.user.id,
            problemSetNum: num,
          },
        }),
        db.problemSetStats.upsert({
          where: { problemSetNum: num },
          create: { problemSetNum: num, stars: 1 },
          update: { stars: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ starred: true }, { status: 201 });
    }
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
