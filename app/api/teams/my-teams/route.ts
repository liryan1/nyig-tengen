import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json([], { status: 203 });
    }

    const teams = await db.team.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      select: {
        slug: true,
        name: true,
      },
    });

    return NextResponse.json(teams, { status: 200 });
  } catch (e) {
    logStack(e);
    return NextResponse.json(
      { message: "Failed to get teams" },
      { status: 500 },
    );
  }
}
