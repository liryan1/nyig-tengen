"use client";

import { useIsMobile } from "@/hooks/isMobile";
import { GoGame } from "@/lib/go/goGame";
import { toSgf } from "@/lib/go/parser";
import { RefObject, useEffect, useRef, useState } from "react";
import { useCellSize } from "@/hooks/useCellSize";
import { useGo } from "@/hooks/useGo";
import { GoProblemBoard } from "./GoProblemBoard";
import { GoProblemToolbar } from "./GoProblemToolbar";
import { ExportSGFButton } from "./node/ExportSGFButton";
import { UploadSGFButton } from "./node/UploadSGFButton";

interface GoProblemEditorProps {
  goGameRef: RefObject<GoGame | null>;
}

export function GoProblemEditor({ goGameRef }: GoProblemEditorProps) {
  const [goGame, setGoGame] = useState(
    () => goGameRef.current || GoGame.fromSgf("(;)"),
  );

  useEffect(() => {
    goGameRef.current = goGame;
  }, [goGame, goGameRef]);
  const { handleMove, handleSelectNode, currentNode, nextPlayer } = useGo({
    goGame,
  });
  const isMobile = useIsMobile();
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { cellSize } = useCellSize({
    boardSize: goGame.boardSize,
    boardContainerRef,
    minCellSize: isMobile ? 3 : 5,
    maxCellSize: isMobile ? 40 : 80,
  });

  const handleUploadSgfChange = (sgf: string) => {
    const newGoGame = GoGame.fromSgf(sgf);
    setGoGame(newGoGame);
  };

  return (
    <div className="grid md:grid-cols-2">
      <div ref={boardContainerRef} className="overflow-none">
        <GoProblemBoard
          cellSize={cellSize}
          boardSize={goGame.boardSize}
          boardState={goGame.getBoardState(currentNode, 1)}
          nextPlayer={nextPlayer}
          onMove={handleMove}
        />
      </div>
      <div className="flex flex-col flex-1 w-full overflow-auto">
        <div className="sm:h-full h-32 md:min-h-40">
          <GoProblemToolbar
            rootNode={goGame.root}
            currentNode={currentNode}
            onSelectNode={handleSelectNode}
          >
            <ExportSGFButton
              className="sticky left-0 sm:left-1 bottom-0 sm:bottom-1"
              getSgfString={() => toSgf(goGame.root, goGame.boardSize)}
            />
            <UploadSGFButton
              onUpload={handleUploadSgfChange}
              goGameRef={goGameRef}
            />
          </GoProblemToolbar>
        </div>
      </div>
    </div>
  );
}
