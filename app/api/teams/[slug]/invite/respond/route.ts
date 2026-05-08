import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { InviteStatus, TeamRole, TeamStatus } from "@prisma/client";
import { logStack } from "@/lib/error";

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    // Expected body: { action: 'ACCEPTED' | 'DECLINED' }
    const [{ slug }, session, { action }] = await Promise.all([
      params,
      getServerSession(authOptions),
      req.json(),
    ]);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // Validate
    if (action !== InviteStatus.ACCEPTED && action !== InviteStatus.DECLINED) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
    // Look up the pending invite for the current user.
    const invite = await db.teamInvite.findFirst({
      select: { id: true },
      where: {
        teamSlug: slug,
        userId: session.user.id,
        status: InviteStatus.PENDING,
      },
    });
    if (!invite)
      return NextResponse.json(
        { message: "No pending invite" },
        { status: 404 },
      );

    // Check if the user is already part of the team
    const membership = await db.teamMembership.findFirst({
      select: { id: true },
      where: { teamSlug: slug, userId: session.user.id },
    });
    if (membership) {
      // If the user is already part of the team, update the invite and return a 203 response
      await db.teamInvite.update({
        where: { id: invite.id },
        data: { status: action },
      });
      return NextResponse.json(
        { message: "User is already part of the team" },
        { status: 203 },
      );
    }

    if (action === InviteStatus.ACCEPTED) {
      await db.$transaction([
        db.teamMembership.create({
          data: {
            userId: session.user.id,
            teamSlug: slug,
            role: TeamRole.MEMBER,
          },
        }),
        // Clean up ANY other pending invites/requests for this user in this team
        db.teamInvite.updateMany({
          where: {
            teamSlug: slug,
            userId: session.user.id,
            status: InviteStatus.PENDING,
          },
          data: { status: InviteStatus.ACCEPTED },
        }),
      ]);
    } else {
      await db.teamInvite.update({
        where: { id: invite.id },
        data: { status: action },
      });
    }

    return NextResponse.json(
      { message: `Invite ${action}ed` },
      { status: 200 },
    );
  } catch (error) {
    logStack(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
