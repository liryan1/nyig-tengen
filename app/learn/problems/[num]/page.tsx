import { GoProblemPage } from "@/components/learn/pages/GoProblemPage";
import { db } from "@/lib/db";

async function ProblemIdPage({ params }: { params: Promise<{ num: string }> }) {
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
