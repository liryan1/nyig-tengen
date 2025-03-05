import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ num: string }> };
/**
 * - If the user has not liked the target yet, create a new like.
 * - If the user already liked it, remove the existing like.
 *
 * Returns JSON:
 * {
 *   "liked": boolean,
 *   "like": { ... } | null
 * }
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    // 1. Verify user is logged in
    const [session, { num }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    if (!session?.user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    if (!num) {
      return NextResponse.json(
        { message: "problem ID is required" },
        { status: 400 },
      );
    }

    // 3. Check if user already has a like for this resource
    const existingLike = await db.problemLike.findFirst({
      where: {
        userId: session.user.id,
        problemNum: num,
      },
      select: { id: true },
    });

    // 4. Toggle logic
    if (existingLike) {
      // Already liked => remove the like
      await db.problemLike.delete({ where: { id: existingLike.id } });
      return NextResponse.json({ liked: false }, { status: 200 });
    } else {
      // Not liked yet => create the like
      await db.problemLike.create({
        data: {
          userId: session.user.id,
          problemNum: num,
        },
      });
      return NextResponse.json({ liked: true }, { status: 201 });
    }
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
