"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function GoProblemSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto border rounded-md shadow-sm p-4 space-y-4">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
      <hr className="my-2" />
      {/* Grid mimicking board and sidebar */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Board skeleton */}
        <div
          className="bg-gray-200 rounded animate-pulse"
          style={{ height: "450px" }}
        />
        {/* Sidebar skeleton (messages / toolbar) */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
