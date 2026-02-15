"use client";

import { KoError, SuicideError } from "@/lib/go/error";
import {
  EditProps,
  getNextColor,
  GoGame,
  indicesToCoord,
  SgfNode,
} from "@/lib/go/goGame";
import { StoneColor } from "@/lib/go/interface";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export type BoardMode = "move" | "edit";
export type BoardEditTool = "black" | "white" | "erase";

export interface UseGoProps {
  readonly?: boolean;
  goGame: GoGame;
  initialMode?: BoardMode;
}

export function useGo({ goGame, readonly, initialMode = "move" }: UseGoProps) {
  const [currentNode, setCurrentNode] = useState<SgfNode>(goGame.root);
  const [nextPlayer, setNextPlayer] = useState<StoneColor>(1);
  const [mode, onModeChange] = useState<BoardMode>(initialMode);
  const [editTool, onEditToolChange] = useState<BoardEditTool>("black");
  const setEditTool = useCallback(
    (bet: BoardEditTool) => {
      if (readonly) {
        return;
      }
      onEditToolChange(bet);
    },
    [readonly],
  );

  /**
   * Get the next player
   * @props.ignoreNextPlayer: ignore the current nextPlayer state
   */
  const getNextPlayer = useCallback(
    (props?: {
      useNode?: SgfNode;
      useMode?: BoardMode;
      ignoreNextPlayer?: boolean;
    }): StoneColor => {
      // If edit tool is set, use its color to determine the next player
      if ((props?.useMode ?? mode) === "edit") {
        if (editTool === "black") {
          return 1;
        } else if (editTool === "white") {
          return -1;
        } else {
          // This is the eraser tool
          return 0;
        }
      }
      // We know the next player and don't explicitly ignoring the player
      // e.g. if move tool was clicked, the next move should be nextPlayer
      if (!props?.ignoreNextPlayer && nextPlayer !== 0) {
        return nextPlayer;
      }
      // If we still can't determine the player, try to use the current node
      let node = props?.useNode ?? currentNode;
      if (node) {
        let color = node?.moveColor;
        if (node === goGame.root) {
          // If we're at the root node, check for the last child's
          // move's color and keep the same color
          if (node.children?.length) {
            color = node.children.at(-1)?.moveColor;
            return color ? color : 1;
          }
        } else if (node.moveColor) {
          return getNextColor(node.moveColor);
        } else {
          let curr = node.parent;
          while (curr && !color) {
            curr = curr.parent;
            color = curr?.moveColor;
          }
          if (!color) {
            color = -1;
          }
          return getNextColor(color);
        }
      }
      return 1;
    },
    [mode, editTool, nextPlayer, currentNode, goGame.root],
  );

  const setMode = useCallback(
    (mode: BoardMode) => {
      if (readonly) {
        return;
      }
      if (mode === "edit") {
        setNextPlayer(0);
      } else if (mode === "move") {
        setNextPlayer(getNextPlayer({ useNode: currentNode, useMode: "move" }));
      }
      onModeChange(mode);
    },
    [readonly, currentNode, getNextPlayer],
  );

  const handleMove = useCallback(
    (row: number, col: number, node?: SgfNode) => {
      if (readonly) {
        return;
      }
      const coord = indicesToCoord(row, col);
      const np = node
        ? getNextPlayer({ useNode: node, ignoreNextPlayer: true })
        : nextPlayer;

      try {
        let newNode;
        if (!coord) {
          newNode = goGame.playPass(node ?? currentNode, np);
        } else {
          newNode = goGame.playMove(node ?? currentNode, np, coord);
        }
        setCurrentNode(newNode);
        setNextPlayer(getNextColor(np));
      } catch (error) {
        if (error instanceof SuicideError || error instanceof KoError) {
          toast.error(error.message);
        }
      }
    },
    [readonly, nextPlayer, currentNode, goGame, getNextPlayer],
  );

  const handleEditStone = useCallback(
    (row: number, col: number, editTool: BoardEditTool) => {
      if (readonly) {
        return;
      }
      const coord = indicesToCoord(row, col);
      const boardState = goGame.getBoardState(currentNode);
      const stone = boardState.stones[coord];

      let edit: EditProps | undefined = undefined;
      if (editTool === "erase") {
        if (stone === 1 || stone === -1) {
          edit = { removeStones: [coord] };
        }
      } else if (editTool === "black") {
        edit = stone === 1 ? { removeStones: [coord] } : { addBlack: [coord] };
      } else if (editTool === "white") {
        edit = stone === -1 ? { removeStones: [coord] } : { addWhite: [coord] };
      }
      if (!edit) {
        return;
      }
      const newNode = goGame.editOnRoot(edit);
      setCurrentNode(newNode);
    },
    [readonly, currentNode, goGame],
  );

  const handleResetVariations = () => {
    goGame.root.children = [];
    handleSelectNode(goGame.root);
  };

  const handleClickBoard = useCallback(
    (row: number, col: number, editTool?: BoardEditTool) => {
      if (readonly) {
        return;
      }
      if (mode === "move") {
        handleMove(row, col);
      } else if (mode === "edit") {
        if (!editTool) {
          toast.error("Edit tool is not set");
        } else {
          handleEditStone(row, col, editTool);
        }
      } else {
        toast.error("Unhandled board mode");
      }
    },
    [readonly, mode, handleMove, handleEditStone],
  );

  const handleSelectNode = useCallback(
    (node: SgfNode) => {
      if (readonly) {
        return;
      }
      setMode("move");
      setCurrentNode(node);
      setNextPlayer(
        getNextPlayer({
          useNode: node,
          useMode: "move",
          ignoreNextPlayer: true,
        }),
      );
    },
    [readonly, getNextPlayer],
  );

  const handleDeleteNode = useCallback(
    (node: SgfNode) => {
      try {
        const parent = goGame.deleteNode(node);
        handleSelectNode(parent);
      } catch (error) {
        toast.error(`Failed to delete node: ${error}`);
      }
    },
    [goGame, handleSelectNode],
  );

  return {
    currentNode,
    setCurrentNode,
    handleSelectNode,
    handleDeleteNode,
    handleResetVariations,

    nextPlayer,
    setNextPlayer,
    getNextPlayer,

    handleMove,
    handleEditStone,
    handleClickBoard,

    mode,
    setMode,

    editTool,
    setEditTool,
  };
}
