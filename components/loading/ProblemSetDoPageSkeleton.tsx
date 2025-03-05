import { Skeleton } from "../ui/skeleton";
import { GoProblemSkeleton } from "./GoProblemSkeleton";

export function ProblemSetDoPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-36" />
      </div>
      <GoProblemSkeleton />
    </div>
  );
}
