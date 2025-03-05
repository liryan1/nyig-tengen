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
  problemNum,
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
    data: problem,
    isLoading: pLoading,
    isError: pError,
  } = useGetProblemQuery({ num: problemNum }, { skip: !problemNum });

  const isLoading = pgLoading || pLoading;
  if (isLoading) {
    return <ProblemSetDoPageSkeleton />;
  }

  if (pError || pgError) {
    return <PageError>Error loading problem!</PageError>;
  }

  if (!problem) {
    return <PageError>Problem could not be loaded</PageError>;
  }

  if (!progress) {
    redirect(`/learn/sets/${psetNum}`);
  }
  const currentIndex = progress.problemOrder?.findIndex(
    (p) => p.problemNum === problemNum,
  );
  if (currentIndex === -1) {
    return <PageError>Problem not found in the problem order</PageError>;
  }

  return (
    <div className="space-y-2 md:space-y-6">
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
