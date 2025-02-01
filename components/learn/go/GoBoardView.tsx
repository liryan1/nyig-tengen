import { useShowCoord } from "@/components/providers/ShowCoordProvider";
import { FLOWER_POINT_POSITIONS } from "@/lib/go/constants";
import { getNextColor } from "@/lib/go/goLogic";
import { BoardHistory, StoneColor } from "@/lib/go/interface";
import { cn } from "@/lib/utils";
import React from "react";

const coordinateCN = "absolute h-4 w-4 flex items-center justify-center";

const fillColorMap: Record<StoneColor, string> = {
  1: "black",
  [-1]: "white",
  0: "transparent",
};

interface GoBoardViewProps {
  className?: string;
  /**
   * pixels between lines - VERY IMPORTANT
   * sets the size of the component along with boardSize
   * @default 40 px
   */
  cellSize?: number;
  /**
   * Current state of the stones on the board
   */
  fullBoardHistory: BoardHistory[];
  /**
   * Callback when a stone is placed on the board. Requires nextPlayer
   * to be set in order to invoke
   * @param row - row of the intersection
   * @param col - column of the intersection
   */
  onMove?: (row: number, col: number, nextPlayer: StoneColor) => void;
  /**
   * Readonly mode disables editing
   */
  readonly?: boolean;
  /**
   * Display mode
   * numbers for showing the numbers of the sequence in board history
   * lastMove only shows an indicator for the previous played move
   * @default numbers
   */
  mode?: "numbers" | "lastMove";
  /**
   * Show an icon in the middle of the board
   */
  icon?: React.ReactNode;
}

export function GoBoardView({
  fullBoardHistory,
  onMove,
  cellSize = 40,
  className,
  readonly,
  mode = "numbers",
  icon,
}: GoBoardViewProps) {
  const { showCoord } = useShowCoord();
  const boardHistory = fullBoardHistory.at(-1);
  if (!boardHistory) {
    throw Error("Empty board history, nothing to render");
  }
  const { color, board, move } = boardHistory;
  const initialColor = fullBoardHistory[0].color;
  const boardSize = board.length;
  const sequenceMap = fullBoardHistory.slice(1).map((h, index) => {
    const [row, col] = h.move as [number, number];
    return {
      row,
      col,
      index: index + 1,
      // start with own color
      color: index & 1 ? getNextColor(initialColor) : initialColor,
    };
  });
  const nextPlayer = sequenceMap?.length
    ? sequenceMap[sequenceMap.length - 1].color
    : getNextColor(color);
  // If showing sequence, hide the indicator
  const indicator =
    mode === "lastMove" && move && board[move[0]][move[1]] !== 0
      ? { move, color: board[move[0]][move[1]] }
      : undefined;

  const stoneSize = 0.92 * cellSize;
  const margin = cellSize * 0.95; // margin around the board
  const boardPixelSize = (boardSize - 1) * cellSize + margin * 2;

  const handleIntersectionClick = (
    event: React.MouseEvent<SVGCircleElement, MouseEvent>,
    row: number,
    col: number,
  ) => {
    if (!readonly && event && onMove && color) {
      handleEmptySpaceHoverLeave(event, board[row][col]);
      onMove(row, col, nextPlayer);
    }
  };

  const handleEmptySpaceHoverEnter = (
    event: React.MouseEvent<SVGCircleElement, MouseEvent>,
    stone: StoneColor,
  ) => {
    if (!readonly && stone === 0 && (nextPlayer == 1 || nextPlayer == -1)) {
      event.currentTarget?.setAttribute("fill", fillColorMap[nextPlayer]);
      event.currentTarget?.setAttribute("opacity", "0.75");
    }
  };

  const handleEmptySpaceHoverLeave = (
    event: React.MouseEvent<SVGCircleElement, MouseEvent>,
    stone: StoneColor,
  ) => {
    if (!readonly && stone === 0 && (nextPlayer == 1 || nextPlayer == -1)) {
      event.currentTarget?.setAttribute("fill", fillColorMap[0]);
      event.currentTarget?.setAttribute("opacity", "1");
    }
  };

  return (
    <div className={cn("relative inline-block select-none", className)}>
      <svg
        width={boardPixelSize}
        height={boardPixelSize}
        className="bg-[url(/board.jpg)]"
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

        {board.map((rowArray, row) =>
          rowArray.map((stone, col) => {
            const cx = margin + col * cellSize;
            const cy = margin + row * cellSize;
            return (
              <circle
                key={`move-${row}-${col}`}
                cx={cx}
                cy={cy}
                r={stoneSize / 2}
                fill={fillColorMap[stone]}
                stroke="black"
                strokeWidth={stone !== 0 ? "1.5px" : "0px"}
                onMouseEnter={(e) => handleEmptySpaceHoverEnter(e, stone)}
                onMouseLeave={(e) => handleEmptySpaceHoverLeave(e, stone)}
                onClick={(e) => handleIntersectionClick(e, row, col)}
              />
            );
          }),
        )}

        {indicator && (
          <circle
            cx={margin + indicator.move[1] * cellSize}
            cy={margin + indicator.move[0] * cellSize}
            r={stoneSize / 3.5}
            fill="transparent"
            stroke={indicator.color === -1 ? "black" : "white"}
            strokeWidth="2.5px"
          />
        )}

        {mode === "numbers" &&
          sequenceMap?.map(
            (seq) =>
              board[seq.row][seq.col] !== 0 && (
                <React.Fragment key={`seq-${seq.row}-${seq.col}-${seq.index}`}>
                  <circle
                    cx={margin + seq.col * cellSize}
                    cy={margin + seq.row * cellSize}
                    r={stoneSize / 2}
                    fill={seq.color === -1 ? "black" : "white"}
                    stroke="black"
                    strokeWidth="1.5px"
                  />
                  <text
                    x={margin + seq.col * cellSize}
                    y={margin + seq.row * cellSize}
                    // function of x that scales from f(1) = 1 to f(3) = 0.8
                    fontSize={
                      cellSize *
                      0.55 *
                      (1 - 0.1 * (seq.index.toString().length - 1))
                    }
                    fill={seq.color === -1 ? "white" : "black"}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {seq.index}
                  </text>
                </React.Fragment>
              ),
          )}
      </svg>

      {showCoord && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-black">
          {Array.from({ length: boardSize }, (_, i) => (
            <div key={i}>
              <span
                className={coordinateCN}
                style={{
                  bottom: margin + i * cellSize - 8,
                  left: cellSize * 0.05,
                  fontSize: cellSize * 0.35,
                }}
              >
                {i + 1}
              </span>
              <span
                className={coordinateCN}
                style={{
                  bottom: margin + i * cellSize - 8,
                  right: cellSize * 0.05,
                  fontSize: cellSize * 0.35,
                }}
              >
                {i + 1}
              </span>
              <span
                className={coordinateCN}
                style={{
                  bottom: cellSize * 0.05,
                  left: margin + i * cellSize - 8,
                  fontSize: cellSize * 0.35,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span
                className={coordinateCN}
                style={{
                  top: cellSize * 0.05,
                  left: margin + i * cellSize - 8,
                  fontSize: cellSize * 0.35,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
            </div>
          ))}
        </div>
      )}
      {icon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-fade-scale">{icon}</div>
        </div>
      )}
    </div>
  );
}
