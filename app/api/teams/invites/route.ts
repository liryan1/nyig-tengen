import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { InviteType } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    const invites = await db.teamInvite.findMany({
      where: {
        AND: [
          { status: "PENDING" },
          {
            OR: [
              { userId: userId, type: InviteType.INVITE },
              // TODO: uncomment after team search & request to join team feature
              // { team: { ownerId: userId }, type: InviteType.REQUEST },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        team: {
          select: {
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
        type: true,
        createdAt: true,
      },
    });

    return NextResponse.json(invites);
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
