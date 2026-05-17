import { db } from "@/lib/db";
import { Metadata } from "next";
import TeamMembersClient from "./TeamMembersClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = await db.team.findUnique({
    where: { slug },
    select: { name: true },
  });

  if (!team) {
    return {
      title: "Team Not Found",
    };
  }

  return {
    title: `Members | ${team.name}`,
    description: `Manage members for ${team.name}.`,
  };
}

export default async function TeamMembersPage({ params }: Props) {
  const { slug } = await params;
  return <TeamMembersClient slug={slug} />;
}
