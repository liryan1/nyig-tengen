import { StatefulPagination } from "@/components/nav/StatefulPagination";
import { getBoardSize, getRootBoardState } from "@/lib/go/parser";
import { ProblemOrderItem, PSetProblem } from "@/lib/rtk/slices/problemSets";
import { cn } from "@/lib/utils";
import { SubmissionStatus } from "@prisma/client";
import { CircleCheckBigIcon, CircleHelpIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { ReadonlyGoBoard } from "../go/board/ReadonlyGoBoard";

interface ProblemGridProps {
  problems: PSetProblem[];
  problemOrder?: ProblemOrderItem[];
  onProblemClick: (id: string) => void;
}

export function ProblemGrid({
  problems,
  problemOrder,
  onProblemClick,
}: ProblemGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [columns, setColumns] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);

  // Use useLayoutEffect to measure container width before the browser paints.
  useLayoutEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setContainerWidth(width);
        // For example, use a breakpoint of 200px per column, with a minimum of 2 columns.
        const newColumns = Math.max(2, Math.floor(width / 200));
        setColumns(newColumns);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const itemsPerPage = columns * 2; // Always 2 rows.
  const totalPages = Math.ceil(problems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProblems = problems.slice(startIndex, startIndex + itemsPerPage);

  // Helper to display an icon based on problem status.
  const getIcon = (status?: SubmissionStatus) => {
    const iconSize = containerWidth / itemsPerPage / 2;
    if (status === "solved") {
      return <CircleCheckBigIcon className="text-green-600" size={iconSize} />;
    }
    if (status === "mismatch" || status === "partial") {
      return (
        <CircleHelpIcon
          className="text-slate-500"
          size={iconSize}
          strokeWidth={1.5}
        />
      );
    }
    return null;
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* Grid: use CSS grid with dynamic columns */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {currentProblems.map((problem, i) => {
          // Each board’s display area width equals containerWidth divided by the number of columns.
          const boardAreaWidth = containerWidth / columns;
          const boardSize = getBoardSize(problem.initial);
          const cellSize = boardAreaWidth / (boardSize + 1);
          // Determine the problem’s original index (for progress icon lookup).
          const problemIndex = startIndex + i;
          return (
            <div
              key={problem.num}
              className={cn(
                "overflow-hidden",
                problemOrder ? "cursor-pointer" : "",
              )}
              onClick={() => onProblemClick(problem.num)}
            >
              <ReadonlyGoBoard
                className="hover:shadow-lg"
                boardState={getRootBoardState(problem.initial)}
                boardSize={boardSize}
                cellSize={cellSize}
                icon={
                  problemOrder && getIcon(problemOrder[problemIndex]?.status)
                }
              />
            </div>
          );
        })}
      </div>
      {/* Render pagination only if needed */}
      {totalPages > 1 && (
        <div className="mt-4">
          <StatefulPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

export default ProblemGrid;
