"use client";

import { useGetProblemQuery } from "@/lib/rtk/slices/problems";
import { PageSpinner } from "@/components/labels/Spinner";
import { PageError } from "@/components/labels/Error";
import dynamic from "next/dynamic";

const GoProblem = dynamic(() => import("@/components/learn/go/GoProblem"), {
  ssr: false,
  loading: () => <PageSpinner />,
});

export function GoProblemPage({ id }: { id?: string }) {
  const { data, isLoading, isError } = useGetProblemQuery(
    { id: id ?? "" },
    {
      skip: !id,
    },
  );
  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !data) {
    return <PageError>Error loading problem.</PageError>;
  }

  return <GoProblem problem={data} />;
}
