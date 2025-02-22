"use client";

import { type RefObject, useEffect, useState } from "react";

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
}

export function useCellSize({
  boardSize,
  boardContainerRef,
}: UseCellSizeProps) {
  const [boardPixelSize, setBoardPixelSize] = useState(0);
  const [cellSize, setCellSize] = useState(0);

  useEffect(() => {
    function updateSizes() {
      const containerWidth = Math.min(
        boardContainerRef?.current?.clientWidth || 0,
        window.innerWidth,
      );
      const newBoardPixelSize = containerWidth; // Ensure board never overflows
      const newCellSize = newBoardPixelSize / (boardSize + 1);

      setBoardPixelSize(newBoardPixelSize);
      setCellSize(newCellSize);
    }

    updateSizes(); // Run on mount
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, [boardSize, boardContainerRef]);

  return { boardPixelSize, cellSize };
}
