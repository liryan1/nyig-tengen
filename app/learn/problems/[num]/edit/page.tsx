import { GoProblemEditPage } from "@/components/learn/pages/GoProblemEditPage";
import { Metadata } from "next";

type Props = {
  params: Promise<{ num: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { num } = await params;
  return {
    title: `Edit Problem #${num}`,
    description: `Edit Go problem #${num}.`,
  };
}

async function ProblemEditPage({ params }: Props) {
  const { num } = await params;

  return <GoProblemEditPage num={num} />;
}

export default ProblemEditPage;
