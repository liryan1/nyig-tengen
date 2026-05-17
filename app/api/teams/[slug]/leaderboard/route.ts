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
    const limit = parseInt(searchParams.get("limit") || "10");
    const period = searchParams.get("period") || "week";
    const skip = (page - 1) * limit;

    const [session, { slug }] = await Promise.all([
      getServerSession(authOptions),
      params,
    ]);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    let startDate = null;
    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.getFullYear(), now.getMonth(), diff);
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const dateFilter = startDate ? { gte: startDate } : undefined;

    if (slug === "me") {
      const [solvedGroups, completedGroups] = await Promise.all([
        db.submission.groupBy({
          by: ["problemNum"],
          where: {
            userId,
            status: SubmissionStatus.solved,
            problem: { authorId: userId, visibility: "PRIVATE" },
            createdAt: dateFilter,
          },
        }),
        db.problemSetProgress.groupBy({
          by: ["problemSetNum"],
          where: {
            userId,
            status: "completed",
            problemSet: { authorId: userId, visibility: "PRIVATE" },
            updatedAt: dateFilter,
          },
        }),
      ]);

      return NextResponse.json(
        {
          currentPage: 1,
          totalPages: 1,
          members: [
            {
              id: userId,
              name: session.user.name ?? "You",
              assignedName: null,
              role: "OWNER",
              joinedAt: new Date().toISOString(),
              problemsSolved: solvedGroups.length,
              setsCompleted: completedGroups.length,
            },
          ],
        },
        { status: 200 },
      );
    }

    const team = await db.team.findUnique({
      where: { slug },
      select: {
        teamProblems: { select: { problemNum: true } },
        teamProblemSets: { select: { problemSetNum: true } },
        memberships: {
          select: {
            assignedName: true,
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
      },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const teamProblemNums = team.teamProblems.map((tp) => tp.problemNum);
    const teamPSetNums = team.teamProblemSets.map((tps) => tps.problemSetNum);
    const memberUserIds = team.memberships.map((m) => m.user.id);

    const [solvedStats, completedStats] = await Promise.all([
      db.submission.groupBy({
        by: ["userId", "problemNum"],
        where: {
          userId: { in: memberUserIds },
          status: SubmissionStatus.solved,
          problemNum: { in: teamProblemNums },
          createdAt: dateFilter,
        },
      }),
      db.problemSetProgress.groupBy({
        by: ["userId", "problemSetNum"],
        where: {
          userId: { in: memberUserIds },
          status: "completed",
          problemSetNum: { in: teamPSetNums },
          updatedAt: dateFilter,
        },
      }),
    ]);

    const solvedMap = new Map<string, number>();
    solvedStats.forEach((s) => {
      solvedMap.set(s.userId, (solvedMap.get(s.userId) || 0) + 1);
    });

    const completedMap = new Map<string, number>();
    completedStats.forEach((c) => {
      completedMap.set(c.userId, (completedMap.get(c.userId) || 0) + 1);
    });

    const allMembers = team.memberships.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      assignedName: m.assignedName,
      role: m.role,
      joinedAt: m.createdAt.toISOString(),
      problemsSolved: solvedMap.get(m.user.id) || 0,
      setsCompleted: completedMap.get(m.user.id) || 0,
    }));

    allMembers.sort((a, b) => {
      if (b.problemsSolved !== a.problemsSolved) {
        return b.problemsSolved - a.problemsSolved;
      }
      if (b.setsCompleted !== a.setsCompleted) {
        return b.setsCompleted - a.setsCompleted;
      }
      return a.name.localeCompare(b.name);
    });

    const paginatedMembers = allMembers.slice(skip, skip + limit);

    return NextResponse.json(
      {
        currentPage: page,
        totalPages: Math.ceil(allMembers.length / limit),
        members: paginatedMembers,
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
