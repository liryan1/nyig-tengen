"use client";

import { useGetProblemQuery } from "@/lib/rtk/slices/problems";
import { PageSpinner } from "../../labels/Spinner";
import { PageError } from "../../labels/Error";
import { GoProblemSubmit } from "./GoProblemSubmit";

interface GoProblemProps {
  problemId: string;
}

function GoProblem({ problemId }: GoProblemProps) {
  const { data, isLoading, isError } = useGetProblemQuery(problemId, {
    skip: !problemId,
  });
  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !data) {
    return <PageError>Error getting the problem</PageError>;
  }

  return <GoProblemSubmit problem={data} />;
}

export default GoProblem;
