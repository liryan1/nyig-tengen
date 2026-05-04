import { ProblemSetPage } from "@/components/learn/pages/ProblemSetPage";
import { db } from "@/lib/db";

type Params = { params: Promise<{ sNum: string }> };

async function ProblemSetIdPage({ params }: Params) {
  const { sNum } = await params;

  await db.problemSetStats.upsert({
    where: { problemSetNum: sNum },
    update: { views: { increment: 1 } },
    create: {
      problemSetNum: sNum,
      views: 1,
    },
  });

  return <ProblemSetPage sNum={sNum} />;
}

export default ProblemSetIdPage;
