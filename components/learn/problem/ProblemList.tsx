import { authOptions } from "@/app/api/auth/authOptions";
import { ProblemCardSkeleton } from "@/components/loading/ProblemCardSkeleton";
import { GoProblemResponse } from "@/lib/go/interface";
import { CirclePlusIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PageError } from "../../labels/Error";
import { Button } from "../../ui/button";

const ProblemCard = dynamic(
  () => import("@/components/learn/problem/ProblemCard"),
  { ssr: true, loading: () => <ProblemCardSkeleton /> },
);

interface ProblemListProps {
  problems: GoProblemResponse[];
  problemFilter?: React.ReactNode;
  pagination?: React.ReactNode;
  isError?: boolean;
  showMoreButton?: boolean;
}

export async function ProblemList({
  problems,
  problemFilter,
  pagination,
  isError,
  showMoreButton,
}: ProblemListProps) {
  const session = await getServerSession(authOptions);
  const createButton = (
    <Button size="sm">
      <Link href="/learn/problems/create" className="flex items-center gap-2">
        <CirclePlusIcon />
        Create
      </Link>
    </Button>
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-6">
          <span className="text-2xl font-medium">Problems</span>
          {session?.user?.role === "ADMIN" && showMoreButton && createButton}
        </div>
        {showMoreButton && (
          <Button variant="link" size="sm" className="px-0">
            <Link href="/learn/problems">All problems</Link>
          </Button>
        )}
        {session?.user?.role === "ADMIN" && !showMoreButton && createButton}
      </div>
      {problemFilter}
      {pagination}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isError ? (
          <PageError>Error getting problems</PageError>
        ) : (
          problems.map((problem) => (
            <ProblemCard key={problem.id} goProblemResponse={problem} />
          ))
        )}
      </div>
      {pagination}
    </div>
  );
}
