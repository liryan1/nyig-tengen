import { ProblemSetDoPage } from "@/components/learn/pages/ProblemSetDoPage";
import { db } from "@/lib/db";
import { Metadata } from "next";

type Props = { params: Promise<{ sNum: string; pNum: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sNum, pNum } = await params;
  const [pset, problem] = await Promise.all([
    db.problemSet.findUnique({
      where: { num: sNum },
      select: { name: true },
    }),
    db.problem.findUnique({
      where: { num: pNum },
      select: { rank: true },
    }),
  ]);

  if (!pset || !problem) {
    return {
      title: "Problem Not Found",
    };
  }

  const rankStr =
    problem.rank < 0 ? `${Math.abs(problem.rank)}k` : `${problem.rank}d`;

  return {
    title: `Problem #${pNum} (${rankStr}) | ${pset.name}`,
    description: `Solving problem #${pNum} in the ${pset.name} problem set.`,
  };
}

async function SetIdProblemIdPage({ params }: Props) {
  const { sNum, pNum } = await params;
  return <ProblemSetDoPage psetNum={sNum} problemNum={pNum} />;
}

export default SetIdProblemIdPage;
