"use client";

import { GoBoardCutoff, makeCutoffSquare } from "@/lib/go/display";
import { type RefObject, useLayoutEffect, useState } from "react";

interface UseCellSizeProps {
  /**
   * The size of the board in number of intersections
   * @default 19
   */
  boardSize: number;
  /**
   * Ref to the parent container in which the Go board is rendered.
   * If provided, we measure its width for responsiveness.
   */
  boardContainerRef?: RefObject<HTMLDivElement | null>;
  /**
   * Optional cutoff region to display only part of the board
   */
  cutoff?: GoBoardCutoff;
  /**
   * Whether to force the aspect ratio to be square
   * @default true
   */
  aspectIsSquare?: boolean;
}

export function useCellSize({
  boardSize,
  boardContainerRef,
  cutoff: initialCutoff,
  aspectIsSquare = true,
}: UseCellSizeProps) {
  const [boardPixelSize, setBoardPixelSize] = useState(50);
  const [cellSize, setCellSize] = useState(2);

  useLayoutEffect(() => {
    if (!boardContainerRef?.current) return;

    function updateSizes() {
      if (!boardContainerRef?.current) return;
      const containerWidth = Math.min(
        boardContainerRef.current.clientWidth || 0,
        window.innerWidth,
      );

      let cutoff = initialCutoff;
      if (cutoff && aspectIsSquare) {
        cutoff = makeCutoffSquare(cutoff, boardSize);
      }

      const effectiveWidth = cutoff ? cutoff.maxX - cutoff.minX + 1 : boardSize;

      const newBoardPixelSize = containerWidth;
      const newCellSize = newBoardPixelSize / (effectiveWidth + 1);

      setBoardPixelSize(newBoardPixelSize);
      setCellSize(newCellSize);
    }

    // Create a ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(updateSizes);
    resizeObserver.observe(boardContainerRef.current);

    // Also handle window resize
    window.addEventListener("resize", updateSizes);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSizes);
    };
  }, [boardSize, boardContainerRef, initialCutoff, aspectIsSquare]);

  return { boardPixelSize, cellSize };
}
