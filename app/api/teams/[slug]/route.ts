import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const [session, { slug }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const team = await db.team.findUnique({
      where: { slug },
      select: {
        id: true,
        memberships: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            role: true,
            createdAt: true,
          },
        },
        name: true,
        description: true,
        problems: {
          select: {
            id: true,
            rank: true,
            initial: true,
          },
        },
        problemSets: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                problemSetProblems: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const owner = team.memberships.find(
      (membership) => membership.role === "OWNER",
    );
    if (!owner) {
      return NextResponse.json(
        { message: "Team owner not found" },
        { status: 404 },
      );
    }
    const userIsInTeam = owner.user.id === userId;
    const memberCount = team.memberships.length;
    const problemCount = team.problems.length;
    const problemSetCount = team.problemSets.length;

    const publicResponse = {
      id: slug,
      name: team.name,
      description: team.description,
      owner: {
        id: owner.user.id,
        name: owner.user.name,
      },
      memberCount,
      problemCount,
      problemSetCount,
    };

    if (!userIsInTeam) {
      return NextResponse.json(publicResponse, { status: 200 });
    }

    return NextResponse.json(
      {
        ...publicResponse,
        members: team.memberships.map((membership) => ({
          ...membership.user,
          role: membership.role,
          joinedAt: membership.createdAt,
        })),
        problems: team.problems,
        problemSets: team.problemSets.map((problemSet) => ({
          id: problemSet.id,
          name: problemSet.name,
          problemCount: problemSet._count.problemSetProblems,
        })),
      },
      { status: 200 },
    );
  } catch (e) {
    logStack(e);
    return NextResponse.json(
      { message: "Failed to get team" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const [{ slug }, session, { name, description }] = await Promise.all([
      params,
      getServerSession(authOptions),
      req.json(),
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const team = await db.team.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Verify user is admin or owner
    const membership = await db.teamMembership.findFirst({
      where: {
        teamId: team.id,
        userId,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!membership) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await db.team.update({
      where: { slug },
      data: { name, description },
    });

    return NextResponse.json({ message: "Update successful" }, { status: 200 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "An error occurred while updating the team" },
      { status: 500 },
    );
  }
}
