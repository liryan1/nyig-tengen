import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { InviteStatus, TeamRole, TeamStatus } from "@prisma/client";
import { logStack } from "@/lib/error";

export async function POST(
  req: Request,
  { params }: { params: { slug: string; inviteId: string } },
) {
  try {
    // Expected body: { action: 'ACCEPTED' | 'DECLINED' }
    const [{ slug, inviteId }, session, { action }] = await Promise.all([
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

    // Verify the requester is an owner.
    const adminMembership = await db.teamMembership.findFirst({
      where: {
        teamSlug: slug,
        userId: session.user.id,
        role: TeamRole.OWNER,
      },
    });
    if (!adminMembership)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Check if the user is already part of the team
    const membership = await db.teamMembership.findFirst({
      select: { id: true },
      where: { teamSlug: slug, userId: session.user.id },
    });
    if (membership) {
      // If the user is already part of the team, delete the invite and return a 203 response
      await db.teamInvite.delete({ where: { id: inviteId } });
      return NextResponse.json(
        { message: "User is already part of the team" },
        { status: 203 },
      );
    }

    await db.$transaction([
      ...(action === InviteStatus.ACCEPTED
        ? [
            db.teamMembership.create({
              data: {
                userId: session.user.id,
                teamSlug: slug,
                role: TeamRole.MEMBER,
              },
            }),
          ]
        : []),
      db.teamInvite.delete({ where: { id: inviteId } }),
    ]);
    return NextResponse.json(
      { message: `Invite ${action}ed` },
      { status: 200 },
    );
  } catch (error) {
    logStack(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
