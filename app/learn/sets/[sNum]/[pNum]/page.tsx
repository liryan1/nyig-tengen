import { ProblemSetDoPage } from "@/components/learn/pages/ProblemSetDoPage";

type Params = { params: Promise<{ sNum: string; pNum: string }> };

async function SetIdProblemIdPage({ params }: Params) {
  const { sNum, pNum } = await params;
  return <ProblemSetDoPage psetNum={sNum} problemNum={pNum} />;
}

export default SetIdProblemIdPage;
