"use client";

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
}

export function useCellSize({
  boardSize,
  boardContainerRef,
}: UseCellSizeProps) {
  const [boardPixelSize, setBoardPixelSize] = useState(50);
  const [cellSize, setCellSize] = useState(2);

  useLayoutEffect(() => {
    if (!boardContainerRef?.current) return;

    function updateSizes() {
      const containerWidth = Math.min(
        boardContainerRef?.current?.clientWidth || 0,
        window.innerWidth,
      );
      const newBoardPixelSize = containerWidth;
      const newCellSize = newBoardPixelSize / (boardSize + 1);

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
  }, [boardSize, boardContainerRef]);

  return { boardPixelSize, cellSize };
}
