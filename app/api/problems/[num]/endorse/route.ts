import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ num: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    // 1. Verify user is logged in
    const [session, { num }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    if (!num) {
      return NextResponse.json(
        { message: "problem ID is required" },
        { status: 400 },
      );
    }

    if (!session?.user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }
    if (session?.user?.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Check if there is already an endorsement
    const existing = await db.problemEndorsement.findFirst({
      where: {
        problemNum: num,
      },
      select: { user: { select: { id: true, name: true } } },
    });

    if (existing) {
      if (existing.user.id !== session.user.id) {
        return NextResponse.json(
          { message: `Problem was already endorsed by ${existing.user.name}` },
          { status: 409 },
        );
      }
      await db.problemEndorsement.delete({
        where: {
          problemNum: num,
          userId: session.user.id,
        },
      });
      return NextResponse.json({ endorsed: false }, { status: 200 });
    }

    await db.problemEndorsement.create({
      data: {
        userId: session.user.id,
        problemNum: num,
      },
    });
    return NextResponse.json({ endorsed: true }, { status: 201 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
