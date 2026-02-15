import { cn } from "@/lib/utils";
import React from "react";

const coordinateCN =
  "absolute h-4 w-4 flex items-center justify-center text-black";

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
  const edge = cellSize * 0.01;

  return (
    <>
      {Array.from({ length: boardSize }, (_, i) => (
        <React.Fragment key={i}>
          <span
            className={cn(coordinateCN, className)}
            style={{
              bottom: margin + i * cellSize - 8,
              left: edge,
              fontSize,
            }}
          >
            {i + 1}
          </span>
          <span
            className={cn(coordinateCN, className)}
            style={{
              bottom: margin + i * cellSize - 8,
              right: edge,
              fontSize,
            }}
          >
            {i + 1}
          </span>
          <span
            className={cn(coordinateCN, className)}
            style={{
              bottom: edge,
              left: margin + i * cellSize - 8,
              fontSize,
            }}
          >
            {String.fromCharCode(65 + i)}
          </span>
          <span
            className={cn(coordinateCN, className)}
            style={{
              top: edge,
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
