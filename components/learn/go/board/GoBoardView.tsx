import { FLOWER_POINT_POSITIONS } from "@/lib/go/constants";
import {
  getPixelSize,
  GoBoardCutoff,
  makeCutoffSquare,
} from "@/lib/go/display";
import { BoardState, StoneColor } from "@/lib/go/interface";
import { cn } from "@/lib/utils";
import React from "react";

const getCoord = (c: string) => c.charCodeAt(0) - 97;

const fillColorMap: Record<StoneColor, string> = {
  1: "black",
  [-1]: "white",
  0: "transparent",
};

export interface GoBoardViewProps {
  className?: string;
  /**
   * pixels between lines - VERY IMPORTANT
   * sets the size of the component along with boardSize
   * @default 40 px
   */
  cellSize?: number;
  /**
   * State of the board defined by size, stones, and labels
   */
  boardState: BoardState;
  /**
   * Size of the board
   * @default 19
   */
  boardSize?: number;
  /**
   * Show an icon in the middle of the board
   */
  icon?: React.ReactNode;
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

export function GoBoardView({
  boardState,
  cellSize = 40,
  boardSize = 19,
  className,
  icon,
  cutoff: initialCutoff,
  aspectIsSquare = true,
}: GoBoardViewProps) {
  const { stones, labels } = boardState;
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

  return (
    <>
      <svg
        width={viewWidth}
        height={viewHeight}
        viewBox={viewBox}
        className={cn(
          "bg-[url(/board.jpg)] absolute inline-block select-none",
          className,
        )}
      >
        {/* Horizontal lines */}
        {Array.from({ length: endY - startY + 1 }, (_, i) => {
          const row = startY + i;
          const offset = row * cellSize + margin;
          const addedLine = row === boardSize - 1 || row === 0 ? 0.75 : 0;

          const x1 =
            startX === 0
              ? margin - addedLine
              : startX * cellSize + margin - cellSize * 0.5;
          const x2 =
            endX === boardSize - 1
              ? (boardSize - 1) * cellSize + margin + addedLine
              : endX * cellSize + margin + cellSize * 0.5;

          return (
            <line
              key={`h-${row}`}
              x1={x1}
              y1={offset}
              x2={x2}
              y2={offset}
              stroke="black"
              strokeWidth={row === boardSize - 1 || row === 0 ? 1.5 : 1}
            />
          );
        })}

        {/* Vertical lines */}
        {Array.from({ length: endX - startX + 1 }, (_, i) => {
          const col = startX + i;
          const offset = col * cellSize + margin;
          const addedLine = col === boardSize - 1 || col === 0 ? 0.75 : 0;

          const y1 =
            startY === 0
              ? margin - addedLine
              : startY * cellSize + margin - cellSize * 0.5;
          const y2 =
            endY === boardSize - 1
              ? (boardSize - 1) * cellSize + margin + addedLine
              : endY * cellSize + margin + cellSize * 0.5;

          return (
            <line
              key={`v-${col}`}
              x1={offset}
              y1={y1}
              x2={offset}
              y2={y2}
              stroke="black"
              strokeWidth={col === boardSize - 1 || col === 0 ? 1.5 : 1}
            />
          );
        })}

        {FLOWER_POINT_POSITIONS[boardSize]
          ?.filter(
            (c) =>
              c[1] >= startX && c[1] <= endX && c[0] >= startY && c[0] <= endY,
          )
          .map((c) => (
            <circle
              key={`star-point-${c[0]}-${c[1]}`}
              cx={margin + c[1] * cellSize}
              cy={margin + c[0] * cellSize}
              r={stoneSize / 8}
              fill="black"
            />
          ))}

        {Object.entries(stones ?? {})
          .filter(([coord]) => {
            const col = getCoord(coord[0]);
            const row = getCoord(coord[1]);
            return col >= startX && col <= endX && row >= startY && row <= endY;
          })
          .map(([coord, color], i) => {
            const cx = margin + getCoord(coord[0]) * cellSize;
            const cy = margin + getCoord(coord[1]) * cellSize;
            return (
              <circle
                key={`move-at-${i}`}
                cx={cx}
                cy={cy}
                r={stoneSize / 2}
                fill={fillColorMap[color]}
                stroke="black"
                strokeWidth={color !== 0 ? "1.5px" : "0px"}
              />
            );
          })}

        {Object.entries(labels ?? {})
          .filter(([coord]) => {
            const col = getCoord(coord[0]);
            const row = getCoord(coord[1]);
            return col >= startX && col <= endX && row >= startY && row <= endY;
          })
          .map(([coord, label], i) => {
            return (
              <text
                key={`label-at-${i}`}
                x={margin + getCoord(coord[0]) * cellSize}
                y={margin + getCoord(coord[1]) * cellSize}
                fontSize={
                  cellSize * 0.55 * (1 - 0.1 * (label.toString().length - 1))
                }
                fill={stones && stones[coord] === 1 ? "white" : "black"}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {label}
              </text>
            );
          })}
      </svg>

      {icon && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="animate-fade-scale">{icon}</div>
        </div>
      )}
    </>
  );
}
