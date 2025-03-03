import { ProblemSetPage } from "@/components/learn/pages/ProblemSetPage";
import { fetchSafe } from "@/lib/fetch";

type Params = { params: Promise<{ sId: string }> };

async function ProblemSetIdPage({ params }: Params) {
  const { sId } = await params;
  fetchSafe(`/problems/sets/${sId}/view`, {
    method: "POST",
    cache: "no-store",
  });

  return <ProblemSetPage sId={sId} />;
}

export default ProblemSetIdPage;
