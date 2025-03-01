import { Skeleton } from "../ui/skeleton";

export const TeamPageSkeleton = () => (
  <div className="container mx-auto py-6 space-y-8">
    <div>
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-4 w-[300px] mt-2" />
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-[200px]" />
      <Skeleton className="h-[200px]" />
    </div>
    <Skeleton className="h-[200px] w-full" />
  </div>
);
