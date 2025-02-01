import { ProblemSetDoPage } from "@/components/learn/sets/ProblemSetDoPage";

type Params = { params: Promise<{ sId: string; pId: string }> };

async function SetIdProblemIdPage({ params }: Params) {
  const { sId, pId } = await params;
  return <ProblemSetDoPage psetId={sId} problemId={pId} />;
}

export default SetIdProblemIdPage;
