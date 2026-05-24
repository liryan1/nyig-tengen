import { GoProblemPage } from "@/components/learn/pages/GoProblemPage";
import { db } from "@/lib/db";
import { getRank } from "@/lib/go/display";
import { Metadata } from "next";

type Props = {
  params: Promise<{ num: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { num } = await params;
  const problem = await db.problem.findUnique({
    where: { num },
    select: { rank: true },
  });

  if (!problem) {
    return {
      title: "Problem Not Found",
    };
  }

  const rankStr = getRank(problem.rank);

  return {
    title: `Problem #${num} (${rankStr})`,
    description: `Practice Go problem #${num}. Rank: ${rankStr}.`,
  };
}

async function ProblemIdPage({ params }: Props) {
  const { num } = await params;

  // Direct DB update is more reliable than fetch for internal server calls
  await db.problemStats.upsert({
    where: { problemNum: num },
    update: { views: { increment: 1 } },
    create: {
      problemNum: num,
      views: 1,
    },
  });

  return <GoProblemPage num={num} />;
}

export default ProblemIdPage;
