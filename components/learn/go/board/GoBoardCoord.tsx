import { cn } from "@/lib/utils";
import React from "react";

const coordinateCN = "absolute h-4 w-4 flex items-center justify-center";

interface GoBoardCoordProps {
  className?: string;
  boardSize: number;
  cellSize: number;
}

/** Renders row/column labels along the edges of a Go board. */
export function GoBoardCoord({
  className,
  boardSize,
  cellSize,
}: GoBoardCoordProps) {
  const margin = cellSize * 0.95;
  const fontSize = cellSize * 0.35;

  return (
    <>
      {Array.from({ length: boardSize }, (_, i) => (
        <React.Fragment key={i}>
          <span
            className={cn(coordinateCN, className)}
            style={{
              bottom: margin + i * cellSize - 8,
              left: cellSize * 0.05,
              fontSize,
            }}
          >
            {i + 1}
          </span>
          <span
            className={cn(coordinateCN, className)}
            style={{
              bottom: margin + i * cellSize - 8,
              right: cellSize * 0.05,
              fontSize,
            }}
          >
            {i + 1}
          </span>
          <span
            className={cn(coordinateCN, className)}
            style={{
              bottom: cellSize * 0.05,
              left: margin + i * cellSize - 8,
              fontSize,
            }}
          >
            {String.fromCharCode(65 + i)}
          </span>
          <span
            className={cn(coordinateCN, className)}
            style={{
              top: cellSize * 0.05,
              left: margin + i * cellSize - 8,
              fontSize,
            }}
          >
            {String.fromCharCode(65 + i)}
          </span>
        </React.Fragment>
      ))}
    </>
  );
}
