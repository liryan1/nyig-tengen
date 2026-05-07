import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";
import { TeamRole } from "@prisma/client";

type Params = { params: Promise<{ slug: string; targetUserId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const [session, { slug, targetUserId }, body] = await Promise.all([
      getServerSession(authOptions),
      params,
      req.json(),
    ]);

    const { role, assignedName } = body;

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify requesting user is the OWNER
    const requestingMember = await db.teamMembership.findFirst({
      where: {
        teamSlug: slug,
        userId,
        role: TeamRole.OWNER,
      },
    });

    if (!requestingMember) {
      return NextResponse.json(
        { message: "Only owners can manage members" },
        { status: 403 },
      );
    }

    const updates: any = {};

    if (role) {
      if (!Object.values(TeamRole).includes(role)) {
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
      }
      // Prevent owner from changing their own role
      if (userId === targetUserId) {
        return NextResponse.json(
          { message: "Owners cannot change their own role" },
          { status: 400 },
        );
      }
      updates.role = role;
    }

    if (assignedName !== undefined) {
      updates.assignedName = assignedName === "" ? null : assignedName;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No updates provided" },
        { status: 400 },
      );
    }

    await db.teamMembership.update({
      where: {
        userId_teamSlug: {
          userId: targetUserId,
          teamSlug: slug,
        },
      },
      data: updates,
    });

    return NextResponse.json({ message: "Update successful" }, { status: 200 });
  } catch (e) {
    logStack(e);
    return NextResponse.json(
      { message: "Failed to update member role" },
      { status: 500 },
    );
  }
}
