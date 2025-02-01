import { ProblemSetCard } from "@/components/learn/sets/ProblemSetCard";
import { PageError } from "../../labels/Error";
import { Button } from "../../ui/button";
import Link from "next/link";
import { GetPSetsProblemSet } from "@/lib/rtk/slices/problemSets";
import { CirclePlusIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";

interface ProblemSetListProps {
  problemSets: GetPSetsProblemSet[];
  isError?: boolean;
}

export async function ProblemSetList({
  problemSets,
  isError,
}: ProblemSetListProps) {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-medium">Problem Sets</span>
          {session?.user?.role === "ADMIN" && (
            <Link href="/learn/sets/create">
              <Button size="sm" variant="outline">
                <CirclePlusIcon />
                Create
              </Button>
            </Link>
          )}
        </div>
        <Button variant="link" size="sm">
          <Link href="/learn/sets">More problem sets</Link>
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
