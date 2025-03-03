"use client";

import { PageError } from "@/components/labels/Error";
import { GoProblemSkeleton } from "@/components/loading/GoProblemSkeleton";
import { useGetProblemQuery } from "@/lib/rtk/slices/problems";
import dynamic from "next/dynamic";

const GoProblem = dynamic(() => import("@/components/learn/go/GoProblem"), {
  ssr: false,
  loading: () => <GoProblemSkeleton />,
});

export function GoProblemPage({ id }: { id?: string }) {
  const { data, isLoading, isError } = useGetProblemQuery(
    { id: id ?? "" },
    {
      skip: !id,
    },
  );
  if (isLoading) {
    return <GoProblemSkeleton />;
  }

  if (isError || !data) {
    return <PageError>Error loading problem.</PageError>;
  }

  return <GoProblem problem={data} />;
}
