import { authOptions } from "@/app/api/auth/authOptions";
import { ProblemFilter } from "@/components/learn/problem/ProblemFilter";
import { ProblemList } from "@/components/learn/problem/ProblemList";
import { Button } from "@/components/ui/button";
import { isUserAdmin } from "@/lib/utils";
import { CirclePlusIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function AllProblemsPage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="container space-y-6 mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-medium">Problems</span>
        {isUserAdmin(session) && (
          <Button size="sm">
            <Link
              href="/learn/problems/new"
              className="flex items-center gap-2"
            >
              <CirclePlusIcon />
              Create
            </Link>
          </Button>
        )}
      </div>
      <ProblemList filter={<ProblemFilter />} />
    </div>
  );
}
