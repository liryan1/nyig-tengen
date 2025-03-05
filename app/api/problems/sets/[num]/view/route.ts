import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ num: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const num = (await params).num;
    await db.problemSetStats.upsert({
      where: { problemSetNum: num },
      update: { views: { increment: 1 } },
      create: {
        problemSetNum: num,
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
