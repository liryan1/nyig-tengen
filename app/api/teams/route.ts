import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/authOptions";
import slugify from "slugify";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const skip = (page - 1) * limit;

    const include: Prisma.TeamInclude = {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          memberships: true,
          teamProblems: true,
          teamProblemSets: true,
        },
      },
    };

    if (userId) {
      include.memberships = {
        where: { userId },
        select: { role: true },
      };
      include.invites = {
        where: {
          userId,
          status: "PENDING",
          type: { in: ["REQUEST", "INVITE"] },
        },
        select: { id: true, type: true },
      };
    }

    const [teams, totalTeams] = await Promise.all([
      db.team.findMany({
        where: {
          status: "ACTIVE",
        },
        include,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.team.count({ where: { status: "ACTIVE" } }),
    ]);

    const mappedTeams = teams.map((team) => ({
      id: team.id,
      slug: team.slug,
      name: team.name,
      description: team.description || undefined,
      memberCount: team._count.memberships,
      problemCount: team._count.teamProblems,
      problemSetCount: team._count.teamProblemSets,
      owner: {
        id: team.owner.id,
        name: team.owner.name,
      },
      myRole: team.memberships?.[0]?.role || null,
      hasPendingRequest: (team.invites?.length ?? 0) > 0,
      pendingInviteType: team.invites?.[0]?.type || null,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      teams: mappedTeams,
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalTeams / limit),
      totalTeams,
    });
  } catch (e) {
    logStack(e);
    return NextResponse.json(
      { message: "Failed to get teams" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const role = session?.user?.role;

    if (!userId || !role) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.json(
        { message: "Only admins can create teams" },
        { status: 403 },
      );
    }

    const { name, description } = await req.json();

    // 1. Generate a base slug from the title.
    const baseSlug = slugify(name, {
      lower: true, // convert to lowercase
      strict: true, // remove characters like punctuation
      remove: /[*+~.()'"!:@]/g,
    });

    // 2. Check if the slug already exists and handle collisions.
    //    For example, if "my-first-post" is taken, try "my-first-post-2", "my-first-post-3", etc.
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await db.team.findUnique({
        where: { slug: uniqueSlug },
      });
      if (!existing) break;
      counter++;
      uniqueSlug = `${baseSlug}-${counter}`;
    }

    const team = await db.team.create({
      data: {
        slug: uniqueSlug,
        name,
        description,
        ownerId: userId,
        memberships: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      select: { slug: true },
    });

    return NextResponse.json({ slug: team.slug }, { status: 201 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "Failed to create team" },
      { status: 500 },
    );
  }
}
