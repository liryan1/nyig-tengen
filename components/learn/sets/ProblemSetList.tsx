import { ProblemSetCard } from "@/components/learn/sets/ProblemSetCard";
import { PageError } from "../../labels/Error";
import { Button } from "../../ui/button";
import Link from "next/link";
import { GetPSetsProblemSet } from "@/lib/rtk/slices/problemSets";

interface ProblemSetListProps {
  problemSets: GetPSetsProblemSet[];
  isError?: boolean;
}

export function ProblemSetList({ problemSets, isError }: ProblemSetListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-medium">Problem Sets</div>
        <Button variant="link" size="sm">
          <Link href="/learn/sets/all">More problem sets</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 5xl:grid-cols-5 gap-4">
        {isError ? (
          <PageError>Error getting problem sets</PageError>
        ) : (
          problemSets.map((problemSet) => (
            <ProblemSetCard key={problemSet.id} problemSet={problemSet} />
          ))
        )}
      </div>
    </div>
  );
}
