import React, { memo } from "react";
import { GoBoardView, GoBoardViewProps } from "./GoBoardView";
import {
  getBoardCutoff,
  getPixelSize,
  makeCutoffSquare,
} from "@/lib/go/display";
import { fromSgf, getRootBoardState } from "@/lib/go/parser";

interface ReadonlyGoBoardProps extends Omit<
  GoBoardViewProps,
  "boardSize" | "boardState"
> {
  sgf?: string;
  /**
   * Whether to force the aspect ratio to be square
   * @default true
   */
  aspectIsSquare?: boolean;
}

export const ReadonlyGoBoard = memo(
  ({
    cellSize = 40,
    icon,
    sgf = "(;SZ[13])",
    aspectIsSquare = true,
    cutoff: passedCutoff,
  }: ReadonlyGoBoardProps) => {
    const boardState = getRootBoardState(sgf);
    const boardSize = boardState.boardSize;
    const { boardPixelSize } = getPixelSize({ boardSize, cellSize });

    let cutoff = passedCutoff;
    if (!cutoff) {
      const root = fromSgf(sgf);
      cutoff = getBoardCutoff([root], boardSize);
    }

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
          icon={icon}
          cutoff={cutoff}
          aspectIsSquare={aspectIsSquare}
        />
      </div>
    );
  },
);
ReadonlyGoBoard.displayName = "ReadonlyGoBoard";
