import { PSetProgressResponse } from "@/lib/rtk/slices/problemSets";
import {
  CheckCircleIcon,
  MoveLeftIcon,
  MoveRightIcon,
  TrophyIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../../ui/button";

export function ProblemSetDoPageHeader({
  progress,
  currentIndex,
  pSetClientUrl,
}: {
  progress: PSetProgressResponse;
  currentIndex: number;
  pSetClientUrl: string;
}) {
  const { problemSet, problemOrder } = progress;
  const prevIndex = currentIndex - 1;
  const nextIndex = currentIndex + 1;

  const hasPrev = prevIndex >= 0;
  const hasNext = nextIndex < problemOrder.length;

  const prevLink = `${pSetClientUrl}/${hasPrev ? problemOrder[prevIndex].problemId : ""}`;
  const nextLink = `${pSetClientUrl}/${hasNext ? problemOrder[nextIndex].problemId : ""}`;

  const completedCount = progress.problemOrder.reduce(
    (acc, p) => (p.status === "solved" ? acc + 1 : acc),
    0,
  );
  const isCompleted = completedCount === problemOrder.length;

  return (
    <>
      <Link
        href={pSetClientUrl}
        className="hover:underline font-semibold sm:text-base md:text-xl"
      >
        {problemSet.name}
      </Link>
      <div className="flex items-center justify-between">
        <Button size="sm" color="secondary" disabled={!hasPrev}>
          <Link href={prevLink} className="flex items-center gap-1">
            <MoveLeftIcon />
            <span className="hidden sm:flex">Previous</span>
          </Link>
        </Button>
        <div className="flex flex-col items-center space-y-1 mx-2">
          <div className="flex items-center gap-1 text-sm md:text-base font-medium">
            <span className="text-muted-foreground">
              Solved: {completedCount} of {problemOrder.length}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-green-600 ml-2">
                <CheckCircleIcon size={16} strokeWidth={3} />
                <span>Complete!</span>
              </span>
            )}
          </div>
        </div>
        <Button color="secondary" size="sm" disabled={!hasNext}>
          <Link className="flex items-center gap-1" href={nextLink}>
            <span className="hidden sm:flex">Next</span>
            <MoveRightIcon />
          </Link>
        </Button>
      </div>
    </>
  );
}
