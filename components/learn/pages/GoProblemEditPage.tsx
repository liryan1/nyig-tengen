"use client";
import { PageError } from "@/components/labels/Error";
import { GoProblemSkeleton } from "@/components/loading/GoProblemSkeleton";
import { useGetProblemQuery } from "@/lib/rtk/slices/problems";
import { useSession } from "next-auth/react";
import { ProblemForm } from "../../forms/ProblemForm";

export function GoProblemEditPage({ pId }: { pId: string }) {
  const { data, status } = useSession();
  const userId = data?.user?.id;
  const {
    data: problem,
    isLoading,
    isError,
  } = useGetProblemQuery(
    { id: pId ?? "", isEdit: true },
    {
      skip: !pId || status !== "authenticated" || !userId,
    },
  );

  if (isLoading) {
    return <GoProblemSkeleton />;
  }

  if (!userId) {
    return <PageError>You must be logged in to edit the problem.</PageError>;
  }

  if (userId && userId !== problem?.author.id) {
    return <PageError>You must be the author to edit this problem.</PageError>;
  }

  if (isError || !problem) {
    return <PageError>Error loading problem.</PageError>;
  }

  return (
    <div>
      <ProblemForm problem={problem} />
    </div>
  );
}
