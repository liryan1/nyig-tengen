"use client";

import { useShowCoord } from "@/components/providers/ShowCoordProvider";
import {
  getPixelSize,
  GoBoardCutoff,
  makeCutoffSquare,
} from "@/lib/go/display";
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
  cutoff?: GoBoardCutoff;
  /**
   * Whether to force the aspect ratio to be square
   * @default true
   */
  aspectIsSquare?: boolean;
}

export function GoProblemBoard({
  cellSize,
  showSuccess,
  boardSize,
  boardState,
  nextPlayer,
  onMove,
  cutoff: initialCutoff,
  aspectIsSquare = true,
}: GoProblemBoardProps) {
  const { showCoord } = useShowCoord();
  const { boardPixelSize } = getPixelSize({ boardSize, cellSize });

  let cutoff = initialCutoff;
  if (cutoff && aspectIsSquare) {
    cutoff = makeCutoffSquare(cutoff, boardSize);
  }

  let viewWidth = boardPixelSize;
  let viewHeight = boardPixelSize;

  if (cutoff) {
    const margin = cellSize; // Matches margin in getPixelSize
    viewWidth = (cutoff.maxX - cutoff.minX) * cellSize + margin * 2;
    viewHeight = (cutoff.maxY - cutoff.minY) * cellSize + margin * 2;
  }

  return (
    <div
      className="overflow-hidden"
      style={{
        position: "relative",
        height: viewHeight,
        width: viewWidth,
      }}
    >
      <GoBoardView
        boardState={boardState}
        boardSize={boardSize}
        cellSize={cellSize}
        cutoff={cutoff}
        aspectIsSquare={aspectIsSquare}
        icon={
          showSuccess && (
            <CircleCheckBigIcon
              className="text-green-600"
              size={viewHeight / 3}
            />
          )
        }
        className="top-0 left-0 z-10"
      />

      {showCoord && (
        <GoBoardCoord
          boardSize={boardSize}
          cellSize={cellSize}
          cutoff={cutoff}
          aspectIsSquare={aspectIsSquare}
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
          cutoff={cutoff}
          aspectIsSquare={aspectIsSquare}
          className="top-0 left-0 z-30"
        />
      )}
    </div>
  );
}
