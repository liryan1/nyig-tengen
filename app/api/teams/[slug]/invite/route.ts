import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/authOptions";
import { InviteStatus, InviteType, TeamStatus } from "@prisma/client";
import { logStack } from "@/lib/error";

type Params = { params: Promise<{ slug: string }> };

/**
 * Invite a list of users to a team
 * req: {
 *   // list of emails
 *  users: string[]
 * }
 */
export async function POST(req: Request, { params }: Params) {
  try {
    const [{ slug }, session, { users }] = await Promise.all([
      params,
      getServerSession(authOptions),
      req.json(),
    ]);

    if (!users?.length) {
      return NextResponse.json(
        { message: "No users to invite" },
        { status: 400 },
      );
    }

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is OWNER or ADMIN of the team.
    const adminMembership = await db.teamMembership.findFirst({
      where: {
        teamSlug: slug,
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });
    if (!adminMembership) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Check validity of user to be invited to the team
    const userIds: ValidUserId[] = await Promise.all(
      users.map((email: string) => getValidUserId(slug, email)),
    );
    if (userIds.some((u) => u.error?.length)) {
      const messages = userIds
        .filter((u) => u.error?.length)
        .map((u) => u.error);
      console.log(messages);
      return NextResponse.json(
        { message: messages.join(", ") },
        { status: 400 },
      );
    }

    await db.$transaction(
      userIds.map((u) =>
        db.teamInvite.create({
          data: {
            teamSlug: slug,
            userId: u.userId,
            createdById: session.user.id,
            type: InviteType.INVITE,
            status: InviteStatus.PENDING,
          },
        }),
      ),
    );

    return NextResponse.json(
      { message: `Successfully invited ${users.length} users` },
      { status: 201 },
    );
  } catch (error) {
    logStack(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

type ValidUserId = { userId: string; error?: string };
async function getValidUserId(
  teamSlug: string,
  email: string,
): Promise<ValidUserId> {
  const user = await db.user.findFirst({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return { userId: "", error: `User with '${email}' not found` };
  }

  // Check if the user is already a member of the team or have an existing invite
  const [existingMembership, existingInvite] = await Promise.all([
    db.teamMembership.findFirst({
      where: {
        teamSlug,
        userId: user.id,
      },
    }),
    db.teamInvite.findFirst({
      where: {
        teamSlug,
        userId: user.id,
        status: InviteStatus.PENDING,
      },
    }),
  ]);
  if (existingMembership) {
    return {
      userId: user.id,
      error: `User '${email}' is already a member of the team`,
    };
  }
  if (existingInvite) {
    return {
      userId: user.id,
      error: `User '${email}' already has a pending invitation`,
    };
  }

  return { userId: user.id };
}
