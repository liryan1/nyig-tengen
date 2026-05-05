import { authOptions } from "@/app/api/auth/authOptions";
import { ProblemFilter } from "@/components/learn/problem/ProblemFilter";
import { ProblemList } from "@/components/learn/problem/ProblemList";
import { Button } from "@/components/ui/button";
import { isUserAdmin } from "@/lib/utils";
import { CirclePlusIcon } from "lucide-react";
import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Problems",
  description: "A unique experience for practicing Go problems.",
};

export default async function AllProblemsPage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="container space-y-6 mx-auto mb-6">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-medium">Problems</span>
        {isUserAdmin(session) && (
          <Link href="/learn/problems/new" className="flex items-center gap-2">
            <Button size="sm">
              <CirclePlusIcon />
              Create
            </Button>
          </Link>
        )}
      </div>
      <ProblemList filter={<ProblemFilter />} />
    </div>
  );
}
