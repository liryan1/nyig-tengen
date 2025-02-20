import { ProblemCard } from "@/components/learn/problem/ProblemCard";
import { PageError } from "../../labels/Error";
import { Button } from "../../ui/button";
import Link from "next/link";
import { GoProblemResponse } from "@/lib/go/interface";
import { CirclePlusIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";

interface ProblemListProps {
  problems: GoProblemResponse[];
  isError?: boolean;
}

export async function ProblemList({ problems, isError }: ProblemListProps) {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-medium">Go Problems</span>
          {session?.user?.role === "ADMIN" && (
            <Link href="/learn/problems/create">
              <Button size="sm" variant="outline">
                <CirclePlusIcon />
                Create
              </Button>
            </Link>
          )}
        </div>
        <Button variant="ghost" size="sm">
          <Link href="/learn/problems">More</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {isError ? (
          <PageError>Error getting problems</PageError>
        ) : (
          problems.map((problem) => (
            <ProblemCard key={problem.id} goProblemResponse={problem} />
          ))
        )}
      </div>
    </div>
  );
}
