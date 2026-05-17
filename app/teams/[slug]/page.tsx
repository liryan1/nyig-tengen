import { TeamPage } from "@/components/teams/TeamPage";
import { db } from "@/lib/db";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = await db.team.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!team) {
    return {
      title: "Team Not Found",
    };
  }

  return {
    title: team.name,
    description: team.description || `Go team ${team.name} on NYIG Tengen.`,
  };
}

function TeamSlugPage() {
  return <TeamPage />;
}

export default TeamSlugPage;
