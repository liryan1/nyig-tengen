import { GoProblemPage } from "@/components/learn/pages/GoProblemPage";
import { fetchSafe } from "@/lib/fetch";

async function ProblemIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  fetchSafe(`/problems/${id}/view`, { method: "POST", cache: "no-store" });
  return <GoProblemPage id={id} />;
}

export default ProblemIdPage;
