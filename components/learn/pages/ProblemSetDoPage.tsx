"use client";

import { GoProblemSkeleton } from "@/components/loading/GoProblemSkeleton";
import { ProblemSetDoPageSkeleton } from "@/components/loading/ProblemSetDoPageSkeleton";
import { useGetProblemQuery } from "@/lib/rtk/slices/problems";
import {
  ProblemOrderItem,
  useGetPSetProgressQuery,
  useGetPSetQuery,
} from "@/lib/rtk/slices/problemSets";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { PageError } from "../../labels/Error";
import { ProblemSetDoPageHeader } from "../sets/ProblemSetDoPageHeader";

const GoProblem = dynamic(() => import("@/components/learn/go/GoProblem"), {
  ssr: false,
  loading: () => <GoProblemSkeleton />,
});

export function ProblemSetDoPage({
  psetNum,
  problemNum: problemIndexStr,
}: {
  psetNum: string;
  problemNum: string;
}) {
  const { status: authStatus } = useSession();
  const {
    data: progress,
    isLoading: pgLoading,
    isError: pgError,
  } = useGetPSetProgressQuery(psetNum, {
    skip: !psetNum || authStatus !== "authenticated",
  });

  const {
    data: pset,
    isLoading: psLoading,
    isError: psError,
  } = useGetPSetQuery(psetNum, { skip: !psetNum });

  const currentIndex = parseInt(problemIndexStr) - 1;

  const problemOrder =
    progress?.problemOrder ||
    pset?.problems?.map((p) => ({ problemNum: p.num })) ||
    [];

  const globalNum = problemOrder?.[currentIndex]?.problemNum;

  const {
    data: problem,
    isLoading: pLoading,
    isError: pError,
  } = useGetProblemQuery({ num: globalNum ?? "" }, { skip: !globalNum });

  const isLoading = pgLoading || pLoading || psLoading;
  if (isLoading) {
    return <ProblemSetDoPageSkeleton />;
  }

  if (pError || pgError || psError) {
    return <PageError>Error loading problem!</PageError>;
  }

  if (!pset) {
    return <PageError>Problem set not found</PageError>;
  }

  if (currentIndex < 0 || currentIndex >= problemOrder.length) {
    return <PageError>Problem not found in the problem order</PageError>;
  }

  if (!problem) {
    return <PageError>Problem could not be loaded</PageError>;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-2 md:space-y-6 mb-6">
      <ProblemSetDoPageHeader
        currentIndex={currentIndex}
        problemOrder={problemOrder}
        problemSetName={progress?.problemSet?.name || pset.name}
        pSetClientUrl={`/learn/sets/${psetNum}`}
      />
      <GoProblem
        problem={problem}
        problemSetProgressId={progress?.id}
        noProgress={!progress}
        initialSuccess={
          progress?.problemOrder[currentIndex]?.status === "solved"
        }
      />
    </div>
  );
}
