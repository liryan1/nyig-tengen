import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { InviteStatus, InviteType, TeamStatus } from "@prisma/client";
import { logStack } from "@/lib/error";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const [{ slug }, session] = await Promise.all([
      params,
      getServerSession(authOptions),
    ]);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Fetch the team by slug. Only active teams can invite new members
    const team = await db.team.findUnique({
      where: { slug, status: TeamStatus.ACTIVE },
    });
    if (!team)
      return NextResponse.json(
        { message: "No active team found" },
        { status: 404 },
      );

    // Check if the user is already a member of the team
    const existingMembership = await db.teamMembership.findFirst({
      where: {
        team: { slug },
        userId: session.user.id,
      },
    });
    if (existingMembership) {
      return NextResponse.json(
        { message: "User is already a member of the team" },
        { status: 400 },
      );
    }

    // Create a pending join request.
    const joinRequest = await db.teamInvite.create({
      data: {
        teamSlug: slug,
        userId: session.user.id,
        status: InviteStatus.PENDING,
        type: InviteType.REQUEST,
      },
    });
    return NextResponse.json({ joinRequest });
  } catch (error) {
    logStack(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
