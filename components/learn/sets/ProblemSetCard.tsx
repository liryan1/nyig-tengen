"use client";
import { useEffect, useRef, useState } from "react";
import { getRank } from "@/lib/go/display";
import { getBoardSize, getRootBoardState } from "@/lib/go/parser";
import { PSetsProblemSet } from "@/lib/rtk/slices/problemSets";
import Link from "next/link";
import { ReadonlyGoBoard } from "../go/board/ReadonlyGoBoard";
import { InfoBar } from "../InfoBar";
import { StartButton } from "./StartButton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProblemSetCardProps {
  problemSet: PSetsProblemSet;
}

export function ProblemSetCard({ problemSet }: ProblemSetCardProps) {
  const { id, name, author, problemCount, averageRank, views, problems } =
    problemSet;

  // Ref for the container div
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSizes, setCellSizes] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Track pagination

  const maxIndex = Math.max(0, problems.length - 3); // Max index for pagination

  // Function to calculate cellSize for each board individually
  const calculateCellSizes = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth; // Get container width
      const boardAreaWidth = containerWidth / 3; // Each board gets 1/3 of the space

      const newCellSizes = problems
        .slice(currentIndex, currentIndex + 3)
        .map((p) => {
          const boardSize = getBoardSize(p);
          return boardAreaWidth / (boardSize + 1);
        });

      setCellSizes(newCellSizes);
    }
  };

  // Recalculate cell sizes on mount, resize, and pagination update
  useEffect(() => {
    calculateCellSizes();
    window.addEventListener("resize", calculateCellSizes);
    return () => window.removeEventListener("resize", calculateCellSizes);
  }, [problems, currentIndex]); // Re-run when problems or index change

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="p-2 space-y-2">
        <div className="flex items-center justify-between">
          <Link
            href={`/learn/sets/${id}`}
            className="text-md font-medium hover:underline"
          >
            {name}
          </Link>
          <StartButton sId={problemSet.id} size="sm" />
        </div>

        <InfoBar
          size="sm"
          info={{
            author,
            rank: getRank(averageRank, true),
            count: problemCount,
            views,
          }}
        />
      </div>
      <hr className="pt-2 pb-1" />

      {/* Board Display with Pagination */}
      <div className="relative flex items-center gap-2 w-full">
        {/* Left Pagination Button */}
        {problems.length > 3 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 z-10 bg-white/80 dark:bg-gray-800/80 rounded-full"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 3))}
          >
            <ChevronLeft size={24} />
          </Button>
        )}

        {/* Boards Container */}
        <div
          ref={containerRef}
          className="flex items-center gap-1 overflow-hidden w-full justify-center px-2"
        >
          {problems.slice(currentIndex, currentIndex + 3).map((p, i) => {
            const boardSize = getBoardSize(p);

            return (
              <div key={i} className="w-1/3 flex-shrink-0 overflow-hidden">
                <AspectRatio ratio={1}>
                  {cellSizes.length === 3 && (
                    <ReadonlyGoBoard
                      boardState={getRootBoardState(p)}
                      boardSize={boardSize}
                      cellSize={cellSizes[i]} // Each board gets a unique cellSize
                    />
                  )}
                </AspectRatio>
              </div>
            );
          })}
        </div>

        {/* Right Pagination Button */}
        {problems.length > 3 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 z-10 bg-white/80 dark:bg-gray-800/80 rounded-full"
            disabled={currentIndex >= maxIndex}
            onClick={() =>
              setCurrentIndex((prev) => Math.min(maxIndex, prev + 3))
            }
          >
            <ChevronRight size={24} />
          </Button>
        )}
      </div>
    </div>
  );
}
