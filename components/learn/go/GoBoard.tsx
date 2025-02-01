"use client";

import { BoardHistory } from "@/lib/go/interface";
import { GoBoardStepper } from "./GoBoardStepper";
import { GoBoardView } from "./GoBoardView";
import { useGo } from "./useGo";

interface GoBoardProps {
  maxCellSize?: number;
  iBoardHistory?: BoardHistory[];
  iShowCoord?: boolean;
  iCurrentMove?: number;
}

export function GoBoard({
  maxCellSize = 40,
  iBoardHistory,
  iShowCoord,
  iCurrentMove,
}: GoBoardProps) {
  const { goToMove, playMove, currentMove, boardHistory, cellSize } = useGo({
    iBoardHistory,
    iShowCoord,
    iCurrentMove,
    maxCellSize,
  });

  const boardSize = boardHistory[0]?.board?.length ?? 0;
  const boardPixelSize = (boardSize - 1) * cellSize + cellSize * 2; // Includes margins

  return (
    <div
      className="mx-auto flex flex-col items-center space-y-2 overflow-auto my-6"
      style={{ width: `${boardPixelSize}px` }}
    >
      <GoBoardView
        cellSize={cellSize}
        fullBoardHistory={boardHistory.slice(0, currentMove + 1)}
        onMove={playMove}
      />
      <GoBoardStepper
        onCurrentMoveChange={goToMove}
        totalMoves={boardHistory.length - 1}
        currentMove={currentMove}
      />
    </div>
  );
}
