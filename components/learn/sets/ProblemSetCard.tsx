"use client";
import { ProblemSetCardCarouselSkeleton } from "@/components/loading/ProblemSetCardSkeleton";
import { getRank } from "@/lib/go/display";
import {
  ProblemSetResponse,
  useCreatePSetProgressMutation,
} from "@/lib/rtk/slices/problemSets";
import dynamic from "next/dynamic";
import Link from "next/link";
import { InfoBar } from "../InfoBar";
import { StartButton } from "./StartButton";
import { Card } from "@/components/ui/card";
import { CalendarPlusIcon } from "lucide-react";

const ProblemCarousel = dynamic(
  () => import("@/components/learn/sets/ProblemCarousel"),
  { ssr: false, loading: () => <ProblemSetCardCarouselSkeleton /> },
);

interface ProblemSetCardProps {
  problemSet: ProblemSetResponse;
  onCreatePSetProgress: ReturnType<typeof useCreatePSetProgressMutation>[0];
  psetCreateLoading?: boolean;
  psetCreateError?: boolean;
}

export function ProblemSetCard({
  problemSet,
  onCreatePSetProgress,
  psetCreateError,
  psetCreateLoading,
}: ProblemSetCardProps) {
  const {
    num,
    name,
    author,
    problemCount,
    averageRank,
    views,
    problems,
    likes,
    userLiked,
    createdAt,
  } = problemSet;

  return (
    <Card>
      <div className="p-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <Link
              href={`/learn/sets/${num}`}
              className="text-md font-semibold hover:underline"
            >
              {name}
            </Link>
            <div className="flex items-center text-[11px] gap-x-0.5 text-muted-foreground">
              <CalendarPlusIcon size={12} />
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <StartButton
            onCreatePSetProgress={onCreatePSetProgress}
            isLoading={psetCreateLoading}
            isError={psetCreateError}
            sNum={problemSet.num}
            problemOrder={problemSet.userProgress?.problemOrder}
            size="sm"
          />
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
    </Card>
  );
}
