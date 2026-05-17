import { GoProblemPage } from "@/components/learn/pages/GoProblemPage";
import { db } from "@/lib/db";
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

  // Format rank: negative for k, positive for d
  const rankStr =
    problem.rank < 0 ? `${Math.abs(problem.rank)}k` : `${problem.rank}d`;

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
