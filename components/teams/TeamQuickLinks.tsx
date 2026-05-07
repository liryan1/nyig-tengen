"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Puzzle, ListChecks, ArrowRight } from "lucide-react";
import Link from "next/link";

export const TeamQuickLinks = ({ slug }: { slug: string }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
      <Link href={`/learn/problems?team=${slug}`}>
        <Card className="group hover:border-primary/50 transition-colors cursor-pointer overflow-hidden relative shadow-sm h-full">
          <CardContent className="p-2 md:p-6 h-full flex items-center">
            <div className="flex items-center gap-2 md:gap-4 w-full">
              <div className="p-1.5 md:p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                <Puzzle className="h-3.5 w-3.5 md:h-6 md:w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[10px] md:text-lg font-bold leading-tight truncate md:whitespace-normal">
                  Team Problems
                </h3>
                <p className="hidden md:block text-xs md:text-sm text-muted-foreground">
                  View and solve problems curated for this team.
                </p>
              </div>
              <ArrowRight className="h-3 w-3 md:h-5 md:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href={`/learn/sets?team=${slug}`}>
        <Card className="group hover:border-primary/50 transition-colors cursor-pointer overflow-hidden relative shadow-sm h-full">
          <CardContent className="p-2 md:p-6 h-full flex items-center">
            <div className="flex items-center gap-2 md:gap-4 w-full">
              <div className="p-1.5 md:p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                <ListChecks className="h-3.5 w-3.5 md:h-6 md:w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[10px] md:text-lg font-bold leading-tight truncate md:whitespace-normal">
                  Problem Sets
                </h3>
                <p className="hidden md:block text-xs md:text-sm text-muted-foreground">
                  Browse collections and track your set progress.
                </p>
              </div>
              <ArrowRight className="h-3 w-3 md:h-5 md:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};
