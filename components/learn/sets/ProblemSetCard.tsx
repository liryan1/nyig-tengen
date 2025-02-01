"use client";
import { getRank } from "@/lib/go/goLogic";
import { GetPSetsProblemSet } from "@/lib/rtk/slices/problemSets";
import Link from "next/link";
import { GoBoardView } from "../go/GoBoardView";
import { InfoBar } from "../InfoBar";
import { StartButton } from "./StartButton";

interface ProblemSetCardProps {
  problemSet: GetPSetsProblemSet;
}

export function ProblemSetCard({ problemSet }: ProblemSetCardProps) {
  const { id, name, author, problemCount, averageRank, views, problems } =
    problemSet;
  return (
    <div className="border rounded-lg shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-md font-medium">{name}</span>
        <StartButton sId={problemSet.id} size="sm" />
      </div>
      <InfoBar
        size="sm"
        info={{
          author,
          rank: getRank(averageRank, true),
          count: problemCount,
          views,
        }}
      />
      <div className="flex items-center gap-2 overflow-x-auto">
        {problems.slice(0, 3).map((p, i) => (
          <GoBoardView key={i} fullBoardHistory={[p]} cellSize={12} readonly />
        ))}
      </div>

      <Link
        href={`/learn/sets/${id}`}
        className="text-blue-500 text-xs font-medium underline"
      >
        More details
      </Link>
    </div>
  );
}
