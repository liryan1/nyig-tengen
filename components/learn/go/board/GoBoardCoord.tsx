import { GoBoardCutoff, makeCutoffSquare } from "@/lib/go/display";
import { cn } from "@/lib/utils";
import React from "react";

const coordinateCN =
  "absolute h-4 w-4 flex items-center justify-center text-black";

interface GoBoardCoordProps {
  className?: string;
  boardSize: number;
  cellSize: number;
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

/** Renders row/column labels along the edges of a Go board. */
export function GoBoardCoord({
  className,
  boardSize,
  cellSize,
  cutoff: initialCutoff,
  aspectIsSquare = true,
}: GoBoardCoordProps) {
  const margin = cellSize * 0.95;
  const fontSize = cellSize * 0.35;
  const edge = cellSize * 0.01;

  let cutoff = initialCutoff;
  if (cutoff && aspectIsSquare) {
    cutoff = makeCutoffSquare(cutoff, boardSize);
  }

  const minX = cutoff ? cutoff.minX : 0;
  const maxX = cutoff ? cutoff.maxX : boardSize - 1;
  const minY = cutoff ? cutoff.minY : 0;
  const maxY = cutoff ? cutoff.maxY : boardSize - 1;

  return (
    <>
      {/* Column labels (A, B, C...) at top and bottom */}
      {Array.from({ length: maxX - minX + 1 }, (_, i) => {
        const col = minX + i;
        const left = margin + i * cellSize - 8;
        return (
          <React.Fragment key={`col-${col}`}>
            <span
              className={cn(coordinateCN, className)}
              style={{
                top: edge,
                left,
                fontSize,
              }}
            >
              {String.fromCharCode(65 + (col >= 8 ? col + 1 : col))}
            </span>
            <span
              className={cn(coordinateCN, className)}
              style={{
                bottom: edge,
                left,
                fontSize,
              }}
            >
              {String.fromCharCode(65 + (col >= 8 ? col + 1 : col))}
            </span>
          </React.Fragment>
        );
      })}

      {/* Row labels (1, 2, 3...) at left and right */}
      {Array.from({ length: maxY - minY + 1 }, (_, i) => {
        const row = minY + i;
        const top = margin + i * cellSize - 8;
        const rowLabel = boardSize - row;
        return (
          <React.Fragment key={`row-${row}`}>
            <span
              className={cn(coordinateCN, className)}
              style={{
                top,
                left: edge,
                fontSize,
              }}
            >
              {rowLabel}
            </span>
            <span
              className={cn(coordinateCN, className)}
              style={{
                top,
                right: edge,
                fontSize,
              }}
            >
              {rowLabel}
            </span>
          </React.Fragment>
        );
      })}
    </>
  );
}
