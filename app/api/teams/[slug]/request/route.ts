import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { InviteStatus, InviteType, TeamStatus } from "@prisma/client";
import { logStack } from "@/lib/error";

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Params) {
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
        teamSlug: slug,
        userId: session.user.id,
      },
    });
    if (existingMembership) {
      return NextResponse.json(
        { message: "User is already a member of the team" },
        { status: 400 },
      );
    }

    // Check if there is already a pending request or invite
    const existingInvite = await db.teamInvite.findFirst({
      where: {
        teamSlug: slug,
        userId: session.user.id,
      },
    });

    if (existingInvite) {
      if (existingInvite.status === InviteStatus.PENDING) {
        return NextResponse.json(
          { message: "You already have a pending request or invitation" },
          { status: 400 },
        );
      }

      // If it was DECLINED or something else, update it to PENDING REQUEST
      await db.teamInvite.update({
        where: { id: existingInvite.id },
        data: {
          status: InviteStatus.PENDING,
          type: InviteType.REQUEST,
          createdById: session.user.id,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create a new pending join request.
      await db.teamInvite.create({
        data: {
          teamSlug: slug,
          userId: session.user.id,
          createdById: session.user.id,
          status: InviteStatus.PENDING,
          type: InviteType.REQUEST,
        },
      });
    }

    return NextResponse.json({ status: 201 });
  } catch (error) {
    logStack(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
