"use client";

import { BoardEditTool } from "@/hooks/useGo";
import {
  getPixelSize,
  GoBoardCutoff,
  makeCutoffSquare,
} from "@/lib/go/display";
import { indicesToCoord } from "@/lib/go/goGame";
import { BoardState, StoneColor } from "@/lib/go/interface";
import { cn } from "@/lib/utils";
import React from "react";

const fillColorMap: Record<StoneColor, string> = {
  1: "black",
  [-1]: "white",
  0: "transparent",
};

interface GoBoardControlProps {
  className?: string;
  /**
   * pixels between lines - VERY IMPORTANT
   * sets the size of the component along with size
   * @default 40 px
   */
  cellSize?: number;
  /**
   * State of the board defined by size, stones, and labels
   */
  boardState: BoardState;
  /**
   * nextPlayer
   */
  nextPlayer?: StoneColor;
  /**
   * Size of the board
   * @default 19
   */
  boardSize?: number;
  /**
   * Flag to make component not responsive to any actions
   */
  readonly?: boolean;
  /**
   * Callback when a stone is placed on the board. Requires nextPlayer
   * to be set in order to invoke
   * @param row - row of the intersection
   * @param col - column of the intersection
   */
  onMove?: (row: number, col: number) => void;
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

export function GoBoardControl({
  className,
  boardState,
  nextPlayer,
  onMove,
  cellSize = 35,
  boardSize = 19,
  readonly = false,
  cutoff: initialCutoff,
  aspectIsSquare = true,
}: GoBoardControlProps) {
  const { stones } = boardState;
  const { boardPixelSize, stoneSize, margin } = getPixelSize({
    boardSize,
    cellSize,
  });

  let viewBox: string | undefined;
  let viewWidth = boardPixelSize;
  let viewHeight = boardPixelSize;

  let cutoff = initialCutoff;
  if (cutoff && aspectIsSquare) {
    cutoff = makeCutoffSquare(cutoff, boardSize);
  }

  if (cutoff) {
    const { minX, maxX, minY, maxY } = cutoff;
    const vx = minX * cellSize;
    const vy = minY * cellSize;
    const vw = (maxX - minX) * cellSize + margin * 2;
    const vh = (maxY - minY) * cellSize + margin * 2;
    viewBox = `${vx} ${vy} ${vw} ${vh}`;
    viewWidth = vw;
    viewHeight = vh;
  }

  const startX = cutoff ? cutoff.minX : 0;
  const endX = cutoff ? cutoff.maxX : boardSize - 1;
  const startY = cutoff ? cutoff.minY : 0;
  const endY = cutoff ? cutoff.maxY : boardSize - 1;

  const handleIntersectionClick = (
    event: React.MouseEvent<SVGCircleElement, MouseEvent>,
    row: number,
    col: number,
  ) => {
    if (!readonly && event && onMove) {
      onMove(row, col);
      handleEmptySpaceHoverLeave(event, row, col);
    }
  };

  const isEmpty = (row: number, col: number) => {
    const stone = stones && stones[indicesToCoord(row, col)];
    return stone !== 1 && stone !== -1;
  };

  const handleEmptySpaceHoverEnter = (
    event: React.MouseEvent<SVGCircleElement, MouseEvent>,
    row: number,
    col: number,
  ) => {
    if (
      !readonly &&
      (nextPlayer === 1 || nextPlayer === -1) &&
      isEmpty(row, col)
    ) {
      event.currentTarget?.setAttribute("fill", fillColorMap[nextPlayer]);
      event.currentTarget?.setAttribute("opacity", "0.75");
    }
  };

  const handleEmptySpaceHoverLeave = (
    event: React.MouseEvent<SVGCircleElement, MouseEvent>,
    row: number,
    col: number,
  ) => {
    if (
      !readonly &&
      (nextPlayer === 1 || nextPlayer === -1) &&
      isEmpty(row, col)
    ) {
      event.currentTarget?.setAttribute("fill", fillColorMap[0]);
      event.currentTarget?.setAttribute("opacity", "1");
    }
  };

  return (
    <svg
      width={viewWidth}
      height={viewHeight}
      viewBox={viewBox}
      className={cn("select-none inline-block absolute", className)}
    >
      {Array.from({ length: endX - startX + 1 }, (_, i) => {
        const col = startX + i;
        return (
          <React.Fragment key={col}>
            {Array.from({ length: endY - startY + 1 }, (_, j) => {
              const row = startY + j;
              const cx = margin + col * cellSize;
              const cy = margin + row * cellSize;
              return (
                <circle
                  key={`move-${row}-${col}`}
                  cx={cx}
                  cy={cy}
                  r={stoneSize / 2}
                  fill="transparent"
                  stroke="black"
                  strokeWidth="0px"
                  onMouseEnter={(e) => handleEmptySpaceHoverEnter(e, row, col)}
                  onMouseLeave={(e) => handleEmptySpaceHoverLeave(e, row, col)}
                  onClick={(e) => handleIntersectionClick(e, row, col)}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </svg>
  );
}
