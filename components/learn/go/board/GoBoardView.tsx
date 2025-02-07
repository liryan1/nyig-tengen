import { FLOWER_POINT_POSITIONS } from "@/lib/go/constants";
import { getPixelSize } from "@/lib/go/display";
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
}

export function GoBoardView({
  boardState,
  cellSize = 40,
  boardSize = 19,
  className,
  icon,
}: GoBoardViewProps) {
  const { stones, labels } = boardState;
  const { boardPixelSize, stoneSize, margin } = getPixelSize({
    boardSize,
    cellSize,
  });

  return (
    <>
      <svg
        width={boardPixelSize}
        height={boardPixelSize}
        className={cn(
          "bg-[url(/board.jpg)] absolute inline-block select-none",
          className,
        )}
      >
        {[...Array(boardSize)].map((_, i) => {
          // Draw grid lines
          const offset = i * cellSize + margin;
          // Offset to ensure corners are drawn correctly
          const addedLine = i === boardSize - 1 || i === 0 ? 0.75 : 0;
          return (
            <React.Fragment key={i}>
              <line // Horizontal line
                x1={margin - addedLine}
                y1={offset}
                x2={boardPixelSize - margin + addedLine}
                y2={offset}
                stroke="black"
                strokeWidth={i === boardSize - 1 || i === 0 ? 1.5 : 1}
              />
              <line // Vertical line
                x1={offset}
                y1={margin}
                x2={offset}
                y2={boardPixelSize - margin}
                stroke="black"
                strokeWidth={i === boardSize - 1 || i === 0 ? 1.5 : 1}
              />
            </React.Fragment>
          );
        })}

        {FLOWER_POINT_POSITIONS[boardSize]?.map((c) => (
          <circle
            key={`star-point-${c[0]}-${c[1]}`}
            cx={margin + c[1] * cellSize}
            cy={margin + c[0] * cellSize}
            r={stoneSize / 8}
            fill="black"
          />
        ))}

        {Object.entries(stones ?? {}).map(([coord, color], i) => {
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

        {Object.entries(labels ?? {}).map(([coord, label], i) => {
          return (
            <text
              key={`label-at-${i}`}
              x={margin + getCoord(coord[0]) * cellSize}
              y={margin + getCoord(coord[1]) * cellSize}
              // function of x that scales from f(1) = 1 to f(3) = 0.8
              // to reduce font size for larger numbers
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
