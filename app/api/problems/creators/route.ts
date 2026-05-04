import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authorIdsResult = await db.problem.findMany({
      select: { authorId: true },
      distinct: ["authorId"],
    });

    const authorIds = authorIdsResult.map((a) => a.authorId);

    const creators = await db.user.findMany({
      where: {
        id: { in: authorIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(creators, { status: 200 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
