import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const creators = await db.user.findMany({
      where: {
        problems: {
          some: {},
        },
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
