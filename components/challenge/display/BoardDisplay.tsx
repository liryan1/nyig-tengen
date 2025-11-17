import { ReadonlyGoBoard } from "@/components/learn/go/board/ReadonlyGoBoard";
import { CardContent } from "@/components/ui/card";
import { useCellSize } from "@/hooks/useCellSize";
import { getBoardSize } from "@/lib/go/parser";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";

interface BoardSectionProps {
  sgf?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function BoardDisplay({
  sgf = "(;SZ[13])",
  className,
  icon,
}: BoardSectionProps) {
  const boardSize = getBoardSize(sgf);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { cellSize, boardPixelSize } = useCellSize({
    boardContainerRef,
    boardSize,
  });

  return (
    <CardContent className={cn(className, "p-3 sm:p-6")}>
      <div ref={boardContainerRef} className="relative mx-auto w-full max-w-xl">
        <div
          style={{ width: `${boardPixelSize}px`, maxWidth: "100%" }}
          className="mx-auto"
        >
          <ReadonlyGoBoard sgf={sgf} cellSize={cellSize} icon={icon} />
        </div>
      </div>
    </CardContent>
  );
}
