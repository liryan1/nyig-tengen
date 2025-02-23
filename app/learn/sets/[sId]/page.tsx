import { ProblemSetPage } from "@/components/learn/sets/ProblemSetPage";
import { fetchSafe } from "@/lib/fetch";

type Params = { params: Promise<{ sId: string }> };

async function ProblemSetIdPage({ params }: Params) {
  const { sId } = await params;
  fetchSafe(`/problems/sets/${sId}/view`, {
    method: "POST",
    cache: "no-store",
  });

  return (
    <div className="px-1 sm:px-0">
      <ProblemSetPage sId={sId} />
    </div>
  );
}

export default ProblemSetIdPage;
