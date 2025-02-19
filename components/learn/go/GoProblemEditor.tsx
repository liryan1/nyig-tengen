"use client";

import { useIsMobile } from "@/hooks/isMobile";
import { useCellSize } from "@/hooks/useCellSize";
import { useGo } from "@/hooks/useGo";
import { GoGame, SgfNode } from "@/lib/go/goGame";
import { toSgf } from "@/lib/go/parser";
import { RefObject, useEffect, useRef, useState } from "react";
import { GoProblemBoard } from "./GoProblemBoard";
import { GoProblemToolbar } from "./GoProblemToolbar";
import { BoardSizeSelect } from "./tools/BoardSizeSelect";
import { EditButton } from "./tools/EditButton";
import { ExportSGFButton } from "./tools/ExportSGFButton";
import { StoneSwitch } from "./tools/StoneSwitch";
import { UploadSGFButton } from "./tools/UploadSGFButton";
import toast from "react-hot-toast";

interface GoProblemEditorProps {
  goGameRef: RefObject<GoGame | null>;
}

export function GoProblemEditor({ goGameRef }: GoProblemEditorProps) {
  // Sync the goGame's ref to reflect the changes after user upload
  const [goGame, setGoGame] = useState(
    () => goGameRef.current || GoGame.fromSgf("(;)"),
  );
  useEffect(() => {
    goGameRef.current = goGame;
  }, [goGame, goGameRef]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const forceUpdate = () => setUpdateCounter((prev) => prev + 1);
  const [boardSize, setBoardSize] = useState(goGame.boardSize);
  const isMobile = useIsMobile();
  const {
    handleSelectNode,
    handleClickBoard,
    currentNode,
    nextPlayer,
    setNextPlayer,
    mode,
    setMode,
  } = useGo({
    goGame,
  });
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { cellSize, boardPixelSize } = useCellSize({
    boardSize: goGame.boardSize,
    boardContainerRef,
  });

  const handleUploadSgfChange = (sgf: string) => {
    const newGoGame = GoGame.fromSgf(sgf);
    setGoGame(newGoGame);
    forceUpdate();
    toast.success("Successfully loaded SGF content");
  };

  const handleBoardSizeChange = (boardSize: number) => {
    setBoardSize(boardSize);
    goGame.setBoardSize(boardSize);
    handleSelectNode(goGame.root);
    forceUpdate();
  };

  const handleDeleteNode = (node: SgfNode) => {
    try {
      const parent = goGame.deleteNode(node);
      handleSelectNode(parent);
      forceUpdate();
    } catch (error) {
      toast.error(`Failed to delete node: ${error}`);
    }
  };

  const handleClickBoardForcedUpdate = (row: number, col: number) => {
    handleClickBoard(row, col);
    forceUpdate();
  };

  return (
    <div className="grid md:grid-cols-2">
      <div
        className="overflow-hidden"
        ref={boardContainerRef}
        style={{ height: boardPixelSize }}
      >
        <GoProblemBoard
          key={updateCounter}
          cellSize={cellSize}
          boardSize={goGame.boardSize}
          boardState={goGame.getBoardState(currentNode, 1)}
          nextPlayer={nextPlayer}
          onMove={handleClickBoardForcedUpdate}
        />
      </div>
      <div
        className="overflow-hidden"
        style={{ maxHeight: isMobile ? "30vh" : boardPixelSize }}
      >
        <GoProblemToolbar
          rootNode={goGame.root}
          currentNode={currentNode}
          onSelectNode={handleSelectNode}
          onDeleteNode={handleDeleteNode}
        >
          <div className="flex items-end gap-1">
            <EditButton
              disabled={goGame.root !== currentNode}
              isEdit={mode === "edit"}
              toggleIsEdit={(isEdit) => setMode(isEdit ? "edit" : "move")}
            />
            <StoneSwitch stone={nextPlayer} onSwitchStone={setNextPlayer} />
          </div>
          <div className="flex items-end gap-1">
            <BoardSizeSelect
              size={boardSize}
              onChange={handleBoardSizeChange}
            />
            <ExportSGFButton
              getSgfString={() => toSgf(goGame.root, goGame.boardSize)}
            />
            <UploadSGFButton
              onUpload={handleUploadSgfChange}
              goGameRef={goGameRef}
            />
          </div>
        </GoProblemToolbar>
      </div>
    </div>
  );
}
