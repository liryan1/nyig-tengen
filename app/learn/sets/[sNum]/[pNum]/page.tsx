import { ProblemSetDoPage } from "@/components/learn/pages/ProblemSetDoPage";
import { db } from "@/lib/db";
import { Metadata } from "next";

type Props = { params: Promise<{ sNum: string; pNum: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sNum, pNum } = await params;
  const pset = await db.problemSet.findUnique({
    where: { num: sNum },
    select: { name: true },
  });

  if (!pset) {
    return {
      title: "Problem Not Found",
    };
  }

  return {
    title: `${pset.name} #${pNum}`,
    description: `Solving problem #${pNum} in the ${pset.name} problem set.`,
  };
}

async function SetIdProblemIdPage({ params }: Props) {
  const { sNum, pNum } = await params;
  return <ProblemSetDoPage psetNum={sNum} problemNum={pNum} />;
}

export default SetIdProblemIdPage;
