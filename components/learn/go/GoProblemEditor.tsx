"use client";

import { useIsMobile } from "@/hooks/isMobile";
import { useCellSize } from "@/hooks/useCellSize";
import { BoardMode, useGo } from "@/hooks/useGo";
import { GoGame, SgfNode } from "@/lib/go/goGame";
import { toSgf } from "@/lib/go/parser";
import { RefObject, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { GoProblemBoard } from "./GoProblemBoard";
import { GoProblemToolbar } from "./GoProblemToolbar";
import { BoardSizeSelect } from "./tools/BoardSizeSelect";
import { EditButton } from "./tools/EditButton";
import { StoneSwitch } from "./tools/StoneSwitch";
import { UploadSGFButton } from "./tools/UploadSGFButton";
import { PassButton } from "./tools/PassButton";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { GoBoardMenu } from "./GoBoardMenu";

const BOARD_SIZE_KEY = "tengen-problem-create-board-size";

interface GoProblemEditorProps {
  goGameRef: RefObject<GoGame | null>;
  initialMode?: BoardMode;
}

export function GoProblemEditor({
  goGameRef,
  initialMode = "edit",
}: GoProblemEditorProps) {
  const [boardSize, setBoardSize] = useLocalStorage(BOARD_SIZE_KEY, 19);
  const [goGame, setGoGame] = useState(
    () => goGameRef.current || new GoGame({ boardSize }),
  );
  const [updateCounter, setUpdateCounter] = useState(0);
  const forceUpdate = () => setUpdateCounter((prev) => prev + 1);
  const isMobile = useIsMobile();

  // Sync the goGame's ref to reflect the changes after user upload
  useEffect(() => {
    goGameRef.current = goGame;
  }, [goGame, goGameRef]);

  // sync the board size state with goGame
  useEffect(() => {
    if (goGame.boardSize) {
      setBoardSize(goGame.boardSize);
    }
  }, [goGame.boardSize]);

  const {
    mode,
    setMode,
    nextPlayer,
    setNextPlayer,
    currentNode,
    handleSelectNode,
    handleDeleteNode: onDeleteNode,
    editTool,
    setEditTool,
    getNextPlayer,
    handleMove,
    handleClickBoard,
  } = useGo({
    goGame,
    initialMode,
  });
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { cellSize, boardPixelSize } = useCellSize({
    boardSize: goGame.boardSize,
    boardContainerRef,
  });

  const handleUploadSgfChange = (sgf: string) => {
    try {
      const newGoGame = GoGame.fromSgf(sgf);
      setGoGame(newGoGame);
      handleSelectNode(newGoGame.root);
      forceUpdate();
      toast.success("Successfully loaded SGF content");
    } catch (error) {
      toast.error(`Failed to load SGF content: ${error}`);
    }
  };

  const handleBoardSizeChange = (boardSize: number) => {
    setBoardSize(boardSize);
    goGame.setBoardSize(boardSize);
    handleSelectNode(goGame.root);
  };

  const handleDeleteNode = (node: SgfNode) => {
    onDeleteNode(node);
    forceUpdate();
  };

  const handleClickBoardForcedUpdate = (row: number, col: number) => {
    handleClickBoard(row, col, editTool);
    forceUpdate();
  };

  const handleSwapColorChange = () => {
    goGame.swapColors(currentNode);
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
          nextPlayer={getNextPlayer()}
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
              editTool={editTool}
              onEditToolChange={setEditTool}
              onSwapColorChange={handleSwapColorChange}
            />
            <PassButton
              onClick={() => handleMove(-1, -1)}
              disabled={mode === "edit"}
            />
            <StoneSwitch
              disabled={mode === "edit"}
              stone={nextPlayer}
              onSwitchStone={setNextPlayer}
            />
          </div>
          <div className="flex items-end gap-1">
            <BoardSizeSelect
              size={boardSize}
              onChange={handleBoardSizeChange}
              isBoardEmpty={goGame.isEmpty()}
            />
            <GoBoardMenu
              className="aspect-square"
              handleExportSgf={() => toSgf(goGame.root, boardSize)}
              dropdownMenuSide="top"
              onUpload={handleUploadSgfChange}
              boardIsNotEmpty={!goGame.isEmpty()}
            />
          </div>
        </GoProblemToolbar>
      </div>
    </div>
  );
}

export default GoProblemEditor;
