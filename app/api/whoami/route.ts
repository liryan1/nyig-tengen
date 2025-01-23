import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);

  return NextResponse.json(session?.user ?? {user: "No session"});
}
