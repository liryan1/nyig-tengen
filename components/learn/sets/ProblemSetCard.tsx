import { Button } from "@/components/ui/button";
import { getRank } from "@/lib/go/goLogic";
import { GetPSetsProblemSet } from "@/lib/rtk/slices/problemSets";
import Link from "next/link";
import { InfoBar } from "../InfoBar";
import { StartButton } from "./StartButton";

interface ProblemSetCardProps {
  problemSet: GetPSetsProblemSet;
}

export function ProblemSetCard({ problemSet }: ProblemSetCardProps) {
  const { id, name, author, problemCount, averageRank } = problemSet;
  return (
    <div className="border rounded-lg shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-md font-medium">{name}</div>
        <StartButton sId={problemSet.id} size="sm" />
      </div>
      <InfoBar
        size="sm"
        info={{ author, rank: getRank(averageRank, true), count: problemCount }}
      />

      <Link
        href={`/learn/sets/${id}`}
        className="text-blue-500 text-xs font-medium underline"
      >
        More details
      </Link>
    </div>
  );
}
