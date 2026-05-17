import { ProblemSetPage } from "@/components/learn/pages/ProblemSetPage";
import { db } from "@/lib/db";
import { Metadata } from "next";

type Props = { params: Promise<{ sNum: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sNum } = await params;
  const pset = await db.problemSet.findUnique({
    where: { num: sNum },
    select: { name: true, description: true },
  });

  if (!pset) {
    return {
      title: "Problem Set Not Found",
    };
  }

  return {
    title: pset.name,
    description:
      pset.description ||
      `Improve your Go skills with the ${pset.name} problem set.`,
  };
}

async function ProblemSetIdPage({ params }: Props) {
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
