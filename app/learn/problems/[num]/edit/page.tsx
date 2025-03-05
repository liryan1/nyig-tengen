import { GoProblemEditPage } from "@/components/learn/pages/GoProblemEditPage";

async function ProblemEditPage({
  params,
}: {
  params: Promise<{ num: string }>;
}) {
  const { num } = await params;

  return <GoProblemEditPage num={num} />;
}

export default ProblemEditPage;
