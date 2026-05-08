import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";
import { TeamRole } from "@prisma/client";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const [session, { slug }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin or owner
    const membership = await db.teamMembership.findFirst({
      where: {
        teamSlug: slug,
        userId,
        role: { in: [TeamRole.OWNER, TeamRole.ADMIN] },
      },
    });

    if (!membership) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const where = {
      teamSlug: slug,
      OR: [
        {
          assignedName: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          user: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          },
        },
      ],
    };

    const [members, totalCount] = await Promise.all([
      db.teamMembership.findMany({
        where,
        select: {
          role: true,
          assignedName: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: limit,
        skip: skip,
      }),
      db.teamMembership.count({ where }),
    ]);

    return NextResponse.json(
      {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        members: members.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          image: m.user.image,
          role: m.role,
          assignedName: m.assignedName,
          joinedAt: m.createdAt.toISOString(),
        })),
      },
      { status: 200 },
    );
  } catch (e) {
    logStack(e);
    return NextResponse.json(
      { message: "Failed to get team members" },
      { status: 500 },
    );
  }
}
