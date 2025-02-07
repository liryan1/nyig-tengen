import { GoProblemWrapper } from "@/components/learn/go/GoProblemWrapper";
import { fetchSafe } from "@/lib/fetch";

async function ProblemIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  fetchSafe(`/problems/${id}/view`, { method: "POST", cache: "no-store" });
  return <GoProblemWrapper id={id} />;
}

export default ProblemIdPage;
