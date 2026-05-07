"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Puzzle, ListChecks, ArrowRight } from "lucide-react";
import Link from "next/link";

export const TeamQuickLinks = ({ slug }: { slug: string }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Link href={`/learn/problems?team=${slug}`}>
        <Card className="group hover:border-primary/50 transition-colors cursor-pointer overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Puzzle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">Explore Team Problems</h3>
                <p className="text-sm text-muted-foreground">
                  View and solve problems curated for this team.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href={`/learn/sets?team=${slug}`}>
        <Card className="group hover:border-primary/50 transition-colors cursor-pointer overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <ListChecks className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">Explore Team Problem Sets</h3>
                <p className="text-sm text-muted-foreground">
                  Browse collections and track your set progress.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};
