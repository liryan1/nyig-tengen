import { ProblemCard } from "@/components/learn/problems/ProblemCard";
import { GetProblemProblemResponse } from "@/lib/rtk/slices/problems";
import { PageError } from "../../labels/Error";
import { Button } from "../../ui/button";
import Link from "next/link";

interface ProblemListProps {
  problems: GetProblemProblemResponse[];
  isError?: boolean;
}

export function ProblemList({ problems, isError }: ProblemListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-medium">Go Problems</div>
        <Button variant="ghost" size="sm">
          <Link href="/learn/problems/all">More problems</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
        {isError ? (
          <PageError>Error getting problems</PageError>
        ) : (
          problems.map((problem) => (
            <ProblemCard key={problem.id} getproblemProblemResponse={problem} />
          ))
        )}
      </div>
    </div>
  );
}
