"use client";
import { getRank } from "@/lib/go/display";
import { PSetsProblemSet } from "@/lib/rtk/slices/problemSets";
import Link from "next/link";
import { InfoBar } from "../InfoBar";
import { ProblemsCarousel } from "./ProblemsCarousel";
import { StartButton } from "./StartButton";

interface ProblemSetCardProps {
  problemSet: PSetsProblemSet;
}

export function ProblemSetCard({ problemSet }: ProblemSetCardProps) {
  const { id, name, author, problemCount, averageRank, views, problems } =
    problemSet;

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="p-2 space-y-2">
        <div className="flex items-center justify-between">
          <Link
            href={`/learn/sets/${id}`}
            className="text-md font-medium hover:underline"
          >
            {name}
          </Link>
          <StartButton sId={problemSet.id} size="sm" />
        </div>

        <InfoBar
          size="sm"
          info={{
            author,
            rank: getRank(averageRank, true),
            count: problemCount,
            views,
            likes: 0,
          }}
        />
      </div>
      <hr />

      <ProblemsCarousel problems={problems} />
    </div>
  );
}
