"use client";

import { useGetProblemQuery } from "@/lib/rtk/slices/problems";
import { GoProblem } from "./GoProblem";
import { PageSpinner } from "@/components/labels/Spinner";
import { PageError } from "@/components/labels/Error";

export function GoProblemWrapper({ id }: { id?: string }) {
  const { data, isLoading, isError } = useGetProblemQuery(id ?? "", {
    skip: !id,
  });
  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !data) {
    return <PageError>Error loading problems.</PageError>;
  }

  return <GoProblem problem={data} />;
}
