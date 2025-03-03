"use client";

import { GoProblemSkeleton } from "@/components/loading/GoProblemSkeleton";
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
  psetId,
  problemId,
}: {
  psetId: string;
  problemId: string;
}) {
  const { status: authStatus } = useSession();
  const {
    data: progressResponse,
    isLoading: pgLoading,
    isError: pgError,
  } = useGetPSetProgressQuery(psetId, {
    skip: !psetId || authStatus !== "authenticated",
  });
  const {
    data: problem,
    isLoading: pLoading,
    isError: pError,
  } = useGetProblemQuery({ id: problemId }, { skip: !problemId });

  const isLoading = pgLoading || pLoading;
  if (isLoading) {
    return <GoProblemSkeleton />;
  }

  if (pError || pgError) {
    return <PageError>Error loading problem!</PageError>;
  }

  if (!problem) {
    return <PageError>Problem could not be loaded</PageError>;
  }

  if (!progressResponse?.progress) {
    return redirect(`/learn/sets/${psetId}`);
  }
  const currentIndex = progressResponse.progress.problemOrder?.findIndex(
    (p) => p.problemId === problemId,
  );
  if (currentIndex === -1) {
    return <PageError>Problem not found in the problem order</PageError>;
  }

  return (
    <div className="space-y-2 md:space-y-6">
      <ProblemSetDoPageHeader
        currentIndex={currentIndex}
        problemOrder={progressResponse.progress.problemOrder}
        problemSetName={progressResponse.progress.problemSet.name}
        pSetClientUrl={`/learn/sets/${psetId}`}
      />
      <GoProblem
        problem={problem}
        problemSetProgressId={progressResponse.progress.id}
        initialSuccess={
          progressResponse.progress.problemOrder[currentIndex]?.status ===
          "solved"
        }
      />
    </div>
  );
}
