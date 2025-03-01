import { Skeleton } from "@/components/ui/skeleton";

export function ProblemCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[175px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[175px]" />
        <Skeleton className="h-4 w-[125px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  );
}

export default ProblemCardSkeleton;
