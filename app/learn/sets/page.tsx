import { authOptions } from "@/app/api/auth/authOptions";
import { ProblemSetList } from "@/components/learn/sets/ProblemSetList";
import { Button } from "@/components/ui/button";
import { isUserAdmin } from "@/lib/utils";
import { CirclePlusIcon } from "lucide-react";
import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Problem Sets",
  description:
    "Improve your Go skills by practicing on collections of endorsed problem sets.",
};

export default async function ProblemSetsPage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="container space-y-6 mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-medium">Problem Sets</span>
        {isUserAdmin(session) && (
          <Link href="/learn/sets/new" className="flex items-center gap-2">
            <Button size="sm">
              <CirclePlusIcon />
              Create
            </Button>
          </Link>
        )}
      </div>
      <ProblemSetList />
    </div>
  );
}
