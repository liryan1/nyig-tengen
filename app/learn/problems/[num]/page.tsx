import { GoProblemPage } from "@/components/learn/pages/GoProblemPage";
import { fetchSafe } from "@/lib/fetch";

async function ProblemIdPage({ params }: { params: Promise<{ num: string }> }) {
  const { num } = await params;
  fetchSafe(`/problems/${num}/view`, { method: "POST", cache: "no-store" });
  return <GoProblemPage num={num} />;
}

export default ProblemIdPage;
