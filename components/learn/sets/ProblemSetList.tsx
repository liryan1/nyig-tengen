import { ProblemSetCard } from "@/components/learn/sets/ProblemSetCard";
import { PageError } from "../../labels/Error";
import { Button } from "../../ui/button";
import Link from "next/link";
import { PSetsProblemSet } from "@/lib/rtk/slices/problemSets";
import { CirclePlusIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";

interface ProblemSetListProps {
  problemSets: PSetsProblemSet[];
  isError?: boolean;
  showMoreButton?: boolean;
}

export async function ProblemSetList({
  problemSets,
  isError,
  showMoreButton,
}: ProblemSetListProps) {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-6">
          <span className="text-2xl font-medium">Problem Sets</span>
          {session?.user?.role === "ADMIN" && (
            <Button size="sm" variant="outline" disabled>
              <Link
                href="/learn/sets/create"
                className="flex items-center gap-2"
              >
                <CirclePlusIcon />
                Create
              </Link>
            </Button>
          )}
        </div>
        {showMoreButton && (
          <Button variant="link" size="sm" className="px-0">
            <Link href="/learn/sets">All Sets</Link>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 4xl:grid-cols-4 6xl:grid-cols-5 gap-4">
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
