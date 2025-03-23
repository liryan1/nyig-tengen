"use client";

import { PageError } from "@/components/labels/Error";
import { GoProblemSkeleton } from "@/components/loading/GoProblemSkeleton";
import { Button } from "@/components/ui/button";
import { useGetProblemQuery } from "@/lib/rtk/slices/problems";
import { MoveLeftIcon, MoveRightIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const GoProblem = dynamic(() => import("@/components/learn/go/GoProblem"), {
  ssr: false,
  loading: () => <GoProblemSkeleton />,
});

export function GoProblemPage({ num }: { num?: string }) {
  const { data, isLoading, isError, error } = useGetProblemQuery(
    { num: num ?? "" },
    { skip: !num },
  );
  if (isLoading) {
    return <GoProblemSkeleton />;
  }
  console.log("error:", error);

  if (!num || isError || !data) {
    if ((error as any)?.status === 404) {
      return <PageError>Problem not found.</PageError>;
    }
    return <PageError>Error loading problem.</PageError>;
  }

  const prevNum = Number(num) - 1;
  const nextNum = Number(num) + 1;

  return (
    <div className="container mx-auto max-w-7xl space-y-4">
      <div className="flex items-center justify-between">
        <Button size="sm" color="secondary" disabled={prevNum < 1}>
          <Link
            href={`/learn/problems/${prevNum}`}
            className="flex items-center gap-1"
          >
            <MoveLeftIcon />
            <span className="hidden sm:flex">Previous</span>
          </Link>
        </Button>
        <Button color="secondary" size="sm">
          <Link
            className="flex items-center gap-1"
            href={`/learn/problems/${nextNum}`}
          >
            <span className="hidden sm:flex">Next</span>
            <MoveRightIcon />
          </Link>
        </Button>
      </div>
      <GoProblem problem={data} />
    </div>
  );
}
