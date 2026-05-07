import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const TeamPageSkeleton = () => (
  <div className="container mx-auto max-w-7xl space-y-4 md:space-y-6 mb-6 px-4 md:px-6">
    {/* Team Hero Skeleton */}
    <Card className="overflow-hidden border shadow-sm">
      <Skeleton className="h-24 md:h-32 w-full" />
      <div className="p-4 md:p-6 pt-0 md:pt-0 -mt-8 md:-mt-10 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-2">
            <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-lg bg-background p-1" />
            <div className="space-y-2">
              <Skeleton className="h-6 md:h-8 w-48 md:w-64" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <div className="flex gap-4 pt-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Skeleton className="h-8 md:h-10 flex-1 sm:w-32" />
            <Skeleton className="h-8 md:h-10 flex-1 sm:w-32" />
          </div>
        </div>
      </div>
    </Card>

    {/* My Impact Skeleton */}
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24 md:w-32" />
        <Skeleton className="h-8 md:h-9 w-[120px] md:w-[140px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-1 md:pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    {/* Explore Content Skeleton */}
    <div className="space-y-3 md:space-y-4">
      <Skeleton className="h-6 w-32 md:w-40" />
      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-2 md:p-6 flex items-center">
              <div className="flex items-center gap-2 md:gap-4 w-full">
                <Skeleton className="h-7 w-7 md:h-12 md:w-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1 md:space-y-2">
                  <Skeleton className="h-3 md:h-5 w-16 md:w-32" />
                  <Skeleton className="hidden md:block h-3 w-full" />
                </div>
                <Skeleton className="h-3 w-3 md:h-5 md:w-5 shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    {/* Bottom Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="p-0">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="flex gap-8">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
