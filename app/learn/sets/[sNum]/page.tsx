import { ProblemSetPage } from "@/components/learn/pages/ProblemSetPage";
import { fetchSafe } from "@/lib/fetch";

type Params = { params: Promise<{ sNum: string }> };

async function ProblemSetIdPage({ params }: Params) {
  const { sNum } = await params;
  fetchSafe(`/problems/sets/${sNum}/view`, {
    method: "POST",
    cache: "no-store",
  });

  return <ProblemSetPage sNum={sNum} />;
}

export default ProblemSetIdPage;
