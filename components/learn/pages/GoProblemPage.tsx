"use client";

import { PageError } from "@/components/labels/Error";
import { GoProblemSkeleton } from "@/components/loading/GoProblemSkeleton";
import { useGetProblemQuery } from "@/lib/rtk/slices/problems";
import dynamic from "next/dynamic";

const GoProblem = dynamic(() => import("@/components/learn/go/GoProblem"), {
  ssr: false,
  loading: () => <GoProblemSkeleton />,
});

export function GoProblemPage({ num }: { num?: string }) {
  const { data, isLoading, isError, error } = useGetProblemQuery(
    { num: num ?? "" },
    { skip: !num },
  );

  if (isLoading) {
    return <GoProblemSkeleton />;
  }

  if (!num || isError || !data) {
    if ((error as any)?.status === 404) {
      return <PageError>Problem not found.</PageError>;
    }
    return <PageError>Error loading problem.</PageError>;
  }

  return (
    <div className="container mx-auto max-w-7xl mb-6">
      <GoProblem problem={data} />
    </div>
  );
}
