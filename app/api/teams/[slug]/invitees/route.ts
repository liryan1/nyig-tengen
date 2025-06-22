import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const [session, { slug }] = await Promise.all([
    getServerSession(authOptions),
    params,
  ]);
  const search = req.nextUrl.searchParams.get("search")?.trim() || "";
  if (!session?.user) {
    return NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }

  try {
    // 1. Get all userIds already in the team or already invited
    const [memberships, invites] = await Promise.all([
      db.teamMembership.findMany({
        where: { teamSlug: slug },
        select: { userId: true },
      }),
      db.teamInvite.findMany({
        where: { teamSlug: slug },
        select: { userId: true },
      }),
    ]);

    const excludedIds = new Set(
      [...memberships, ...invites].map(({ userId }) => userId),
    );

    // 2. Query users not in the team or invited, matching the search
    const users = await db.user.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) },
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      select: { name: true, email: true },
      take: 500,
    });

    return NextResponse.json(users);
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
