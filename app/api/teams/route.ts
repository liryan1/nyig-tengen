import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/authOptions";
import slugify from "slugify";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const skip = (page - 1) * limit;

    const [teams, totalTeams] = await Promise.all([
      db.team.findMany({
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
      }),
      db.team.count(),
    ]);

    return NextResponse.json({
      teams,
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
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
      const existing = await db.post.findUnique({
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
    });

    return NextResponse.json({ id: team.id }, { status: 201 });
  } catch (error) {
    logStack(error);
    return NextResponse.json(
      { message: "Failed to create team" },
      { status: 500 },
    );
  }
}
