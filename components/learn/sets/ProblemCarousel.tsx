import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getBoardCutoff, makeCutoffSquare } from "@/lib/go/display";
import { fromSgf, getBoardSize } from "@/lib/go/parser";
import { useEffect, useRef, useState } from "react";
import { ReadonlyGoBoard } from "../go/board/ReadonlyGoBoard";

type Props = {
  problems: string[];
};

export function ProblemsCarousel({ problems }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSizes, setCellSizes] = useState<number[]>([]);

  // Function to calculate cellSize for each board individually
  const calculateCellSizes = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const boardAreaWidth = containerWidth / 3.25; // Each board gets 1/3 of the space

      const newCellSizes = problems.map((p) => {
        const boardSize = getBoardSize(p);
        const root = fromSgf(p);
        let cutoff = getBoardCutoff([root], boardSize);
        if (cutoff) {
          cutoff = makeCutoffSquare(cutoff, boardSize);
        }
        const effectiveSize = cutoff
          ? cutoff.maxX - cutoff.minX + 1
          : boardSize;
        return boardAreaWidth / (effectiveSize + 1);
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
            <CarouselItem
              key={index}
              className="basis-1/3 flex items-center justify-center"
            >
              <ReadonlyGoBoard sgf={problem} cellSize={cellSizes[index]} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {problems.length > 0 && (
          <>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </>
        )}
      </Carousel>
    </div>
  );
}

export default ProblemsCarousel;
