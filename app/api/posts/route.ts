import { authOptions } from "@/app/api/auth/authOptions";
import { db } from "@/lib/db";
import { logStack } from "@/lib/error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "10";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Page and limit (defaults if not provided)
    const page = parseInt(searchParams.get("page") || DEFAULT_PAGE, 10);
    const limit = parseInt(searchParams.get("limit") || DEFAULT_LIMIT, 10);

    // Filters: 'author' (matches user ID) and 'name' (matches post title)
    const authorId = searchParams.get("author");
    const name = searchParams.get("name");

    // 2. Construct the 'where' clause dynamically
    const where: any = {};

    if (authorId) {
      // Filter posts by a specific authorId
      where.authorId = authorId;
    }

    if (name) {
      // Filter posts by title containing 'name' (case-insensitive)
      where.title = {
        contains: name,
        mode: "insensitive",
      };
    }

    // 3. Calculate skip/take for pagination
    // Convert 'page' from 1-based index to 0-based offset
    const skip = (page - 1) * limit;

    // 4. Fetch data & total count in a single transaction
    const [posts, totalCount] = await db.$transaction([
      db.post.findMany({
        skip,
        take: limit,
        where,
        orderBy: { publishedAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          likes: {
            select: {
              id: true,
              userId: true,
              postId: true,
            },
          },
        },
      }),
      db.post.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const data = posts.map((post) => ({
      ...post,
      content:
        post.content.slice(0, 200) + (post.content.length > 200 ? "..." : ""),
    }));

    return NextResponse.json({
      page,
      limit,
      totalPages,
      totalCount,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, content, wordCount } = await request.json();
    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required" },
        {
          status: 400,
        },
      );
    }

    // 1. Generate a base slug from the title.
    const baseSlug = slugify(title, {
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

    // 3. Create the post with the unique slug.
    await db.post.create({
      data: {
        title,
        content,
        wordCount,
        slug: uniqueSlug, // store the final slug
        authorId: session.user.id,
      },
    });

    return NextResponse.json({ status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
