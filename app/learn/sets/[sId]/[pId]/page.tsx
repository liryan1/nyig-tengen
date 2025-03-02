import { ProblemSetDoPage } from "@/components/learn/pages/ProblemSetDoPage";

type Params = { params: Promise<{ sId: string; pId: string }> };

async function SetIdProblemIdPage({ params }: Params) {
  const { sId, pId } = await params;
  return <ProblemSetDoPage psetId={sId} problemId={pId} />;
}

export default SetIdProblemIdPage;
