"use client";

import { useShowCoord } from "@/components/providers/ShowCoordProvider";
import { getPixelSize } from "@/lib/go/display";
import { SgfNode } from "@/lib/go/goGame";
import { BoardState, StoneColor } from "@/lib/go/interface";
import { CircleCheckBigIcon } from "lucide-react";
import { GoBoardControl } from "./board/GoBoardControl";
import { GoBoardCoord } from "./board/GoBoardCoord";
import { GoBoardView } from "./board/GoBoardView";

interface GoProblemBoardProps {
  showSuccess?: boolean;
  cellSize: number;
  boardSize: number;
  boardState: BoardState;
  nextPlayer?: StoneColor;
  onMove?: (row: number, col: number, node?: SgfNode) => void;
}

export function GoProblemBoard({
  cellSize,
  showSuccess,
  boardSize,
  boardState,
  nextPlayer,
  onMove,
}: GoProblemBoardProps) {
  const { showCoord } = useShowCoord();
  const { boardPixelSize } = getPixelSize({ boardSize, cellSize });

  console.log("boardState:", boardState);

  return (
    <div
      className="overflow-hidden"
      style={{
        position: "relative",
        height: boardPixelSize,
        width: boardPixelSize,
      }}
    >
      <GoBoardView
        boardState={boardState}
        boardSize={boardSize}
        cellSize={cellSize}
        icon={
          showSuccess && (
            <CircleCheckBigIcon
              className="text-green-600"
              size={cellSize * 2}
            />
          )
        }
        className="top-0 left-0 z-10"
      />

      {showCoord && (
        <GoBoardCoord
          boardSize={boardSize}
          cellSize={cellSize}
          className="z-20"
        />
      )}

      {onMove && (
        <GoBoardControl
          onMove={onMove}
          nextPlayer={nextPlayer}
          boardState={boardState}
          boardSize={boardSize}
          cellSize={cellSize}
          className="top-0 left-0 z-30"
        />
      )}
    </div>
  );
}
