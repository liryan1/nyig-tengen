"use client";
import { useGetProblemQuery } from "@/lib/rtk/slices/problems";
import { ProblemForm } from "../../forms/ProblemForm";
import { PageSpinner } from "@/components/labels/Spinner";
import { PageError } from "@/components/labels/Error";
import { useSession } from "next-auth/react";

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
    return <PageSpinner />;
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
