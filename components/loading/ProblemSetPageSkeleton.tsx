import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProblemGridSkeleton } from "./ProblemGridSkeleton";

export function ProblemSetPageSkeleton() {
  return (
    <Card className="shadow-sm rounded-lg my-6">
      <CardHeader className="p-2 sm:p-4 border-b">
        {/* Title and Trophy Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-48 md:h-10 md:w-64" />
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-8" />
          </div>
          {/* Start Button */}
          <Skeleton className="h-10 w-24" />
        </div>
        {/* Description */}
        <div className="mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
      </CardHeader>

      <CardContent className="p-2 sm:p-4 space-y-4">
        {/* Info Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardContent>

      {/* Progress Counter */}
      <div className="px-2 sm:px-4 text-center">
        <Skeleton className="h-6 w-48 mx-auto" />
      </div>

      {/* Problem Grid */}
      <CardFooter className="gap-2 sm:gap-4 p-2 sm:p-4 flex flex-wrap max-h-[1/2]">
        <ProblemGridSkeleton />
      </CardFooter>
    </Card>
  );
}
