import { ProblemOrderItem } from "@/lib/rtk/slices/problemSets";
import { MoveLeftIcon, MoveRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../../ui/button";

export function ProblemSetDoPageHeader({
  problemSetName,
  problemOrder,
  currentIndex,
  pSetClientUrl,
}: {
  problemSetName: string;
  problemOrder: ProblemOrderItem[];
  currentIndex: number;
  pSetClientUrl: string;
}) {
  const prevIndex = currentIndex - 1;
  const nextIndex = currentIndex + 1;

  const hasPrev = prevIndex >= 0;
  const hasNext = nextIndex < problemOrder.length;

  const prevLink = `${pSetClientUrl}/${hasPrev ? problemOrder[prevIndex].problemNum : ""}`;
  const nextLink = `${pSetClientUrl}/${hasNext ? problemOrder[nextIndex].problemNum : ""}`;

  return (
    <div className="space-y-2 sm:space-y-6 overflow-x-auto">
      <div className="font-semibold text-lg md:text-2xl">{problemSetName}</div>
      <div className="flex items-center justify-between">
        <Link href={prevLink} className="flex items-center gap-1">
          <Button size="sm" color="secondary" disabled={!hasPrev}>
            <MoveLeftIcon />
            <span className="hidden sm:flex">Previous</span>
          </Button>
        </Link>
        <Link href={pSetClientUrl}>
          <Button variant="outline" size="sm" className="text-muted-foreground">
            Problem {currentIndex + 1} of {problemOrder.length}
          </Button>
        </Link>
        <Link className="flex items-center gap-1" href={nextLink}>
          <Button color="secondary" size="sm" disabled={!hasNext}>
            <span className="hidden sm:flex">Next</span>
            <MoveRightIcon />
          </Button>
        </Link>
      </div>
    </div>
  );
}
