"use client";

import { useEffect, useState } from "react";

interface UseCellSizeProps {
  /**
   * Maximum cell size in pixels of each grid of the board
   * @default 100
   */
  maxCellSize?: number;
  /**
   * Minimum cell size in pixels of each grid of the board
   * @default 0
   */
  minCellSize?: number;
  /**
   * The size of the board in number of intersections
   * @default 19
   */
  boardSize: number;
  /**
   * Ref to the parent container in which the Go board is rendered.
   * If provided, we measure its width for responsiveness.
   */
  boardContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function useCellSize({
  maxCellSize = 60,
  minCellSize = 10,
  boardSize,
  boardContainerRef,
}: UseCellSizeProps) {
  const [cellSize, setCellSize] = useState((minCellSize + maxCellSize) / 2);
  useEffect(() => {
    // On small screens, fill available width minus small margins.
    // On larger screens, don't exceed a chosen maxCellSize.
    function handleResize() {
      let width = boardContainerRef?.current?.clientWidth;
      if (!width) {
        // Fallback to use screenwidth for resizing
        const w = window.innerWidth;
        // Some hardcoded numbers here for tailwind breakpoints set at page level
        width = w * (w < 640 ? 0.95 : w < 768 ? 0.9 : w < 1024 ? 0.85 : 0.8);
      }
      // We never want the width to be greater than the screen width, so take the min first
      // before doing the floor calculation
      const dynamicSize = Math.min(window.innerWidth, width) / (boardSize + 1);
      setCellSize(Math.min(dynamicSize, maxCellSize));
    }
    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [boardSize]);

  return { cellSize };
}
