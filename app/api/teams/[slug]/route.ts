import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";
import { TeamResponse } from "@/lib/rtk/slices/teams";
import { TeamRole, TeamStatus, Visibility } from "@prisma/client";
import {
  getProblemSelect,
  mapProblemResponse,
} from "../../problems/problemQuery";
import {
  getProblemSetSelect,
  mapProblemSetResponse,
} from "../../problems/problemSetQuery";

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

    if (slug === "me") {
      // Get personal data, private problem sets and problems
      const [problems, problemSets] = await db.$transaction([
        db.problem.findMany({
          where: {
            author: {
              id: userId,
            },
            visibility: Visibility.PRIVATE,
          },
          select: { id: true },
        }),
        db.problemSet.findMany({
          where: {
            author: {
              id: userId,
            },
            visibility: Visibility.PRIVATE,
          },
          select: { id: true },
        }),
      ]);

      const you = {
        id: userId,
        name: session?.user?.name ?? "You",
        role: TeamRole.OWNER,
      };
      const personalData: TeamResponse = {
        id: "me",
        slug: "me",
        name: "My Personal Team",
        description: "Your private problems and collections",
        memberCount: 1,
        problemCount: problems.length,
        problemSetCount: problemSets.length,
        owner: you,
      };
      return NextResponse.json(personalData, { status: 200 });
    }

    const team = await db.team.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        memberships: {
          where: { userId },
          select: { role: true },
        },
        invites: {
          where: {
            userId,
            status: "PENDING",
            type: { in: ["REQUEST", "INVITE"] },
          },
          select: { id: true, type: true },
        },
        _count: {
          select: {
            memberships: true,
            teamProblems: true,
            teamProblemSets: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const publicResponse: TeamResponse = {
      id: team.id,
      slug: team.slug,
      name: team.name,
      description: team.description || undefined,
      owner: {
        id: team.owner.id,
        name: team.owner.name,
      },
      myRole: team.memberships[0]?.role || null,
      hasPendingRequest: team.invites.length > 0,
      pendingInviteType: team.invites[0]?.type || null,
      memberCount: team._count.memberships,
      problemCount: team._count.teamProblems,
      problemSetCount: team._count.teamProblemSets,
    };

    return NextResponse.json(publicResponse, { status: 200 });
  } catch (e) {
    logStack(e);
    return NextResponse.json(
      { message: "Failed to get team" },
      { status: 500 },
    );
  }
}

// Modify team details
export async function PATCH(req: Request, { params }: Params) {
  try {
    const [{ slug }, session, { name, description, status }] =
      await Promise.all([params, getServerSession(authOptions), req.json()]);

    if (status && !Object.keys(TeamStatus).includes(status)) {
      return NextResponse.json(
        { message: "Invalid team status" },
        { status: 400 },
      );
    }

    // Validate the team and user permissions
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
        teamSlug: slug,
        userId,
        role: { in: [TeamRole.OWNER, TeamRole.ADMIN] },
      },
    });

    if (!membership) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await db.team.update({
      where: { slug },
      data: { name, description, status },
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
