import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";
import { SubmissionStatus } from "@prisma/client";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

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
        teamProblems: { select: { problemNum: true } },
        teamProblemSets: { select: { problemSetNum: true } },
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
          orderBy: {
            createdAt: "asc",
          },
          take: limit,
          skip: skip,
        },
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const teamProblemNums = team.teamProblems.map((tp) => tp.problemNum);
    const teamPSetNums = team.teamProblemSets.map((tps) => tps.problemSetNum);
    const memberUserIds = team.memberships.map((m) => m.user.id);

    // Batch fetch stats for the members on the current page
    const [solvedStats, completedStats] = await Promise.all([
      db.submission.groupBy({
        by: ["userId"],
        where: {
          userId: { in: memberUserIds },
          status: SubmissionStatus.solved,
          problemNum: { in: teamProblemNums },
        },
        _count: { _all: true },
      }),
      db.problemSetProgress.groupBy({
        by: ["userId"],
        where: {
          userId: { in: memberUserIds },
          status: "completed",
          problemSetNum: { in: teamPSetNums },
        },
        _count: { _all: true },
      }),
    ]);

    const solvedMap = new Map(
      solvedStats.map((s) => [s.userId, s._count._all]),
    );
    const completedMap = new Map(
      completedStats.map((c) => [c.userId, c._count._all]),
    );

    const members = team.memberships.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      role: m.role,
      joinedAt: m.createdAt.toISOString(),
      problemsSolved: solvedMap.get(m.user.id) || 0,
      setsCompleted: completedMap.get(m.user.id) || 0,
    }));

    return NextResponse.json(
      {
        currentPage: page,
        totalPages: Math.ceil(team._count.memberships / limit),
        members,
      },
      { status: 200 },
    );
  } catch (e) {
    logStack(e);
    return NextResponse.json(
      { message: "Failed to get team leaderboard" },
      { status: 500 },
    );
  }
}
