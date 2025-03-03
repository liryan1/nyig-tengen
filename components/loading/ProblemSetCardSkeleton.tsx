import { Skeleton } from "@/components/ui/skeleton";

export function ProblemSetCardSkeleton() {
  return (
    <div className="border rounded-lg shadow-sm">
      <div className="p-2 space-y-2">
        <div className="flex items-center justify-between">
          {/* Title skeleton */}
          <Skeleton className="h-5 w-2/3" />
          {/* Start button skeleton */}
          <Skeleton className="h-8 w-20" />
        </div>

        {/* InfoBar skeleton */}
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>

      <hr />

      {/* Problem Carousel skeleton */}
      <ProblemSetCardCarouselSkeleton />
    </div>
  );
}

export function ProblemSetCardCarouselSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 p-2 h-[200px]">
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  );
}
