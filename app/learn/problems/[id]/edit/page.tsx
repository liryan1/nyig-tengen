import { GoProblemEditPage } from "@/components/learn/pages/GoProblemEditPage";

async function ProblemEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <GoProblemEditPage pId={id} />;
}

export default ProblemEditPage;
