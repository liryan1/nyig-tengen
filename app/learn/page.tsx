import { ProblemList } from "@/components/learn/problem/ProblemList";
import { ProblemSetList } from "@/components/learn/sets/ProblemSetList";
import { Button } from "@/components/ui/button";
import { isUserAdmin } from "@/lib/utils";
import { CirclePlusIcon, MoveRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../api/auth/authOptions";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "A unique experience for practicing Go problems and problem sets.",
};

async function LearnPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container space-y-6 sm:space-y-12 mx-auto">
      <div className="space-y-3 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-6">
            <span className="text-2xl font-medium">Problem Sets</span>
            {isUserAdmin(session) && (
              <Button size="sm">
                <Link
                  href="/learn/sets/new"
                  className="flex items-center gap-1"
                >
                  <CirclePlusIcon />
                  <div>
                    Create <span className="hidden sm:inline">problem set</span>
                  </div>
                </Link>
              </Button>
            )}
          </div>
          <Button size="sm" variant="outline">
            <Link href="/learn/sets" className="flex items-center gap-2">
              <div>
                All <span className="hidden sm:inline">problem sets</span>
              </div>
              <MoveRight />
            </Link>
          </Button>
        </div>
        <ProblemSetList fixedLimit={4} />
      </div>
      <div className="space-y-3 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-6">
            <span className="text-2xl font-medium">Problems</span>
            {isUserAdmin(session) && (
              <Button size="sm">
                <Link
                  href="/learn/problems/new"
                  className="flex items-center gap-1"
                >
                  <CirclePlusIcon />
                  <div>
                    Create <span className="hidden sm:inline">problem</span>
                  </div>
                </Link>
              </Button>
            )}
          </div>
          <Button size="sm" variant="outline">
            <Link href="/learn/problems" className="flex items-center gap-2">
              All problems
              <MoveRight />
            </Link>
          </Button>
        </div>
        <ProblemList fixedLimit={20} />
        <div className="flex justify-end">
          <Button size="sm" variant="outline">
            <Link href="/learn/problems" className="flex items-center gap-2">
              More problems
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LearnPage;
