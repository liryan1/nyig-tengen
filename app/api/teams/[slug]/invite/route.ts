import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/authOptions";
import { InviteStatus, InviteType, TeamStatus } from "@prisma/client";
import { logStack } from "@/lib/error";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const [{ slug }, session, { userId }] = await Promise.all([
      params,
      getServerSession(authOptions),
      req.json(),
    ]);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Fetch the team by slug. Only active teams can have new members join
    const team = await db.team.findUnique({
      where: { slug, status: TeamStatus.ACTIVE },
    });
    if (!team)
      return NextResponse.json(
        { message: "No active team found" },
        { status: 404 },
      );

    // Check if current user is OWNER or ADMIN of the team.
    const adminMembership = await db.teamMembership.findFirst({
      where: {
        teamId: team.id,
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });
    if (!adminMembership)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Check if the user is already a member of the team
    const existingMembership = await db.teamMembership.findFirst({
      where: {
        teamId: team.id,
        userId,
      },
    });
    if (existingMembership) {
      return NextResponse.json(
        { message: "User is already a member of the team" },
        { status: 400 },
      );
    }

    // Create an invitation to the user
    const invite = await db.teamInvite.create({
      data: {
        teamSlug: slug,
        userId,
        status: InviteStatus.PENDING,
        type: InviteType.INVITE,
      },
    });
    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    logStack(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
