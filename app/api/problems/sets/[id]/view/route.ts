import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    await db.problemSetStats.upsert({
      where: { problemSetId: (await params).id },
      update: { views: { increment: 1 } },
      create: {
        problemSetId: (await params).id,
        views: 1,
      },
    });
    return NextResponse.json({ message: "Viewed" }, { status: 200 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred during submission" },
      { status: 500 },
    );
  }
}
