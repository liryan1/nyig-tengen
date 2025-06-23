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
        { message: "problem ID is required" },
        { status: 400 },
      );
    }

    const existingStar = await db.problemStar.findFirst({
      where: {
        userId: session.user.id,
        problemNum: num,
      },
      select: { id: true },
    });

    if (existingStar) {
      // Already starred => remove the star
      await db.problemStar.delete({ where: { id: existingStar.id } });
      return NextResponse.json({ starred: false }, { status: 200 });
    } else {
      // Not starred yet => create the star
      await db.problemStar.create({
        data: {
          userId: session.user.id,
          problemNum: num,
        },
      });
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
