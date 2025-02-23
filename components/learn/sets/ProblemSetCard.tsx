"use client";
import { getRank } from "@/lib/go/display";
import { PSetsProblemSet } from "@/lib/rtk/slices/problemSets";
import Link from "next/link";
import { InfoBar } from "../InfoBar";
import { StartButton } from "./StartButton";
import dynamic from "next/dynamic";
import { PageSpinner } from "@/components/labels/Spinner";

const ProblemCarousel = dynamic(
  () => import("@/components/learn/problem/ProblemCarousel"),
  { ssr: false, loading: () => <PageSpinner /> },
);

interface ProblemSetCardProps {
  problemSet: PSetsProblemSet;
}

export function ProblemSetCard({ problemSet }: ProblemSetCardProps) {
  const {
    id,
    name,
    author,
    problemCount,
    averageRank,
    views,
    problems,
    likes,
    userLiked,
  } = problemSet;

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
            userLiked,
            views,
            likes,
          }}
        />
      </div>
      <hr />

      <ProblemCarousel problems={problems} />
    </div>
  );
}
