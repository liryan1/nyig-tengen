import React from "react";
import { GoBoardView, GoBoardViewProps } from "./GoBoardView";
import { getPixelSize } from "@/lib/go/display";
import { getRootBoardState } from "@/lib/go/parser";

interface ReadonlyGoBoardProps
  extends Omit<GoBoardViewProps, "boardSize" | "boardState"> {
  sgf: string;
}

export function ReadonlyGoBoard({
  cellSize = 40,
  icon,
  sgf,
}: ReadonlyGoBoardProps) {
  const boardState = getRootBoardState(sgf);
  const boardSize = boardState.boardSize;
  const { boardPixelSize } = getPixelSize({ boardSize, cellSize });
  return (
    <div
      className="overflow-none"
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
        icon={icon}
      />
    </div>
  );
}
