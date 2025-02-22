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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProblemSetCardProps {
  problemSet: PSetsProblemSet;
}

export function ProblemSetCard({ problemSet }: ProblemSetCardProps) {
  const { id, name, author, problemCount, averageRank, views, problems } =
    problemSet;

  const containerRef = useRef<HTMLDivElement>(null);

  const [cellSizes, setCellSizes] = useState<number[]>([]);

  // Function to calculate cellSize for each board individually
  const calculateCellSizes = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const boardAreaWidth = containerWidth / 3.5; // Each board gets 1/3 of the space

      const newCellSizes = problems.map((p) => {
        const boardSize = getBoardSize(p);
        return boardAreaWidth / (boardSize + 1);
      });

      setCellSizes(newCellSizes);
    }
  };

  // Recalculate cell sizes on mount and resize
  useEffect(() => {
    calculateCellSizes();
    window.addEventListener("resize", calculateCellSizes);
    return () => window.removeEventListener("resize", calculateCellSizes);
  }, [problems]);

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
      <hr />

      {/* Carousel Implementation */}
      <div ref={containerRef} className="relative w-full p-2">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {problems.map((problem, index) => (
              <CarouselItem key={index} className="basis-1/3">
                {cellSizes.length > 0 && (
                  <ReadonlyGoBoard
                    boardState={getRootBoardState(problem)}
                    boardSize={getBoardSize(problem)}
                    cellSize={cellSizes[index]}
                  />
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>
    </div>
  );
}
