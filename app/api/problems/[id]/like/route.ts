import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { logStack } from "@/lib/error";
import { authOptions } from "@/app/api/auth/authOptions";
import { revalidateTag } from "next/cache";
import { ALL_PROBLEMS_TAG } from "@/lib/nextTags";

type Params = { params: Promise<{ id: string }> };
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
    const [session, { id }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    if (!session?.user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { message: "problem ID is required" },
        { status: 400 },
      );
    }

    // 3. Check if user already has a like for this resource
    const existingLike = await db.problemLike.findFirst({
      where: {
        userId: session.user.id,
        problemId: id,
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
          problemId: id,
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
  } finally {
    revalidateTag(ALL_PROBLEMS_TAG);
  }
}
