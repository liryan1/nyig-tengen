import { Skeleton } from "@/components/ui/skeleton";
import { useLayoutEffect, useRef, useState } from "react";

export function ProblemGridSkeleton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [columns, setColumns] = useState(2);

  // Use useLayoutEffect to measure container width before the browser paints
  useLayoutEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setContainerWidth(width);
        const newColumns = Math.max(2, Math.floor(width / 200));
        setColumns(newColumns);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const itemsPerPage = columns * 2; // Always 2 rows
  const boardAreaWidth = (containerWidth / columns) * 0.95;

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-square w-full rounded-md"
            style={{
              width: boardAreaWidth,
              height: boardAreaWidth,
            }}
          />
        ))}
      </div>
      {/* Pagination skeleton */}
      <div className="mt-4 flex justify-center gap-2">
        <Skeleton className="h-6 w-10 rounded-md" />
        <Skeleton className="h-6 w-10 rounded-md" />
        <Skeleton className="h-6 w-10 rounded-md" />
      </div>
    </div>
  );
}
