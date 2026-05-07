import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";

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

    const [recentMembers, recentProblemSets] = await Promise.all([
      db.teamMembership.findMany({
        where: { teamSlug: slug },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
      db.teamProblemSet.findMany({
        where: { teamSlug: slug },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { problemSet: { select: { name: true } } },
      }),
    ]);

    const activity = [
      ...recentMembers.map((m) => ({
        id: `member-${m.id}`,
        type: "member_joined" as const,
        user: { name: m.user.name },
        createdAt: m.createdAt.toISOString(),
      })),
      ...recentProblemSets.map((ps) => ({
        id: `pset-${ps.id}`,
        type: "pset_added" as const,
        contentName: ps.problemSet.name,
        createdAt: ps.createdAt.toISOString(),
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json(activity.slice(0, 10), { status: 200 });
  } catch (e) {
    logStack(e);
    return NextResponse.json(
      { message: "Failed to get team activity" },
      { status: 500 },
    );
  }
}
