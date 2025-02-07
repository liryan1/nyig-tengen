import React from "react";
import { GoBoardView, GoBoardViewProps } from "./GoBoardView";
import { getPixelSize } from "@/lib/go/display";

interface ReadonlyGoBoardProps extends GoBoardViewProps {}

export function ReadonlyGoBoard({
  boardSize = 19,
  cellSize = 40,
  icon,
  boardState,
}: ReadonlyGoBoardProps) {
  const { boardPixelSize } = getPixelSize({ boardSize, cellSize });
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
        icon={icon}
      />
    </div>
  );
}
