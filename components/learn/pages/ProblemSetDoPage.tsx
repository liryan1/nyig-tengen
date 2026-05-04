"use client";

import { GoProblemSkeleton } from "@/components/loading/GoProblemSkeleton";
import { ProblemSetDoPageSkeleton } from "@/components/loading/ProblemSetDoPageSkeleton";
import { useGetProblemQuery } from "@/lib/rtk/slices/problems";
import { useGetPSetProgressQuery } from "@/lib/rtk/slices/problemSets";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
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

  const currentIndex = parseInt(problemIndexStr) - 1;
  const globalNum = progress?.problemOrder?.[currentIndex]?.problemNum;

  const {
    data: problem,
    isLoading: pLoading,
    isError: pError,
  } = useGetProblemQuery({ num: globalNum ?? "" }, { skip: !globalNum });

  const isLoading = pgLoading || pLoading;
  if (isLoading) {
    return <ProblemSetDoPageSkeleton />;
  }

  if (pError || pgError) {
    return <PageError>Error loading problem!</PageError>;
  }

  if (!progress) {
    redirect(`/learn/sets/${psetNum}`);
  }

  if (currentIndex < 0 || currentIndex >= progress.problemOrder.length) {
    return <PageError>Problem not found in the problem order</PageError>;
  }

  if (!problem) {
    return <PageError>Problem could not be loaded</PageError>;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-2 md:space-y-6">
      <ProblemSetDoPageHeader
        currentIndex={currentIndex}
        problemOrder={progress.problemOrder}
        problemSetName={progress.problemSet.name}
        pSetClientUrl={`/learn/sets/${psetNum}`}
      />
      <GoProblem
        problem={problem}
        problemSetProgressId={progress.id}
        initialSuccess={
          progress.problemOrder[currentIndex]?.status === "solved"
        }
      />
    </div>
  );
}
