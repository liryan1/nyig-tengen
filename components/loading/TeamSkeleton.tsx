import { Skeleton } from "../ui/skeleton";

export const TeamPageSkeleton = () => (
  <div className="container mx-auto max-w-7xl space-y-10 pb-20">
    <Skeleton className="h-64 w-full rounded-xl" />
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Skeleton className="h-[400px] w-full" />
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  </div>
);
