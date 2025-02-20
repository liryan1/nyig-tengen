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
import { useState } from "react";
import { toast } from "sonner";

export type BoardMode = "move" | "edit";
export type BoardEditTool = "black" | "white" | "erase";

export interface UseGoProps {
  readonly?: boolean;
  goGame: GoGame;
}

export function useGo({ goGame, readonly }: UseGoProps) {
  const [currentNode, setCurrentNode] = useState<SgfNode>(goGame.root);
  const [nextPlayer, setNextPlayer] = useState<StoneColor>(1);
  const [mode, onModeChange] = useState<BoardMode>("move");
  const [editTool, onEditToolChange] = useState<BoardEditTool>("black");
  const setEditTool = (bet: BoardEditTool) => {
    if (readonly) {
      return;
    }
    onEditToolChange(bet);
  };

  const setMode = (mode: BoardMode) => {
    if (readonly) {
      return;
    }
    // Changing to edit, then next player is no one
    // Changing to move, next player is determined from current node
    if (mode === "edit") {
      setNextPlayer(0);
    } else if (mode === "move") {
      setNextPlayer(getNextPlayer(currentNode));
    }
    onModeChange(mode);
  };

  const getNextPlayer = (
    currNode?: SgfNode,
    ignoreNextPlayer?: boolean,
  ): StoneColor => {
    // If edit tool is set, use its color to determine the next player
    if (mode === "edit") {
      if (editTool === "black") {
        return 1;
      } else if (editTool === "white") {
        return -1;
      } else {
        return 0;
      }
    }
    // We know the next player, just return it
    // e.g. if move tool was clicked, the next move should be nextPlayer
    if (!ignoreNextPlayer && nextPlayer !== 0) {
      return nextPlayer;
    }
    // Then try to use the current node
    if (currNode) {
      let node = currNode;
      let color = node?.moveColor;
      if (node === goGame.root) {
        // If we're at the root node, check for the last child's
        // move's color and keep the same color
        if (currNode.children?.length) {
          color = currNode.children.at(-1)?.moveColor;
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
    return 0;
  };

  const handleMove = (row: number, col: number, node?: SgfNode) => {
    if (readonly) {
      return;
    }
    const coord = indicesToCoord(row, col);

    try {
      const newNode = goGame.playMove(node ?? currentNode, nextPlayer, coord);
      setCurrentNode(newNode);
      setNextPlayer(getNextColor(nextPlayer));
    } catch (error) {
      if (error instanceof SuicideError || error instanceof KoError) {
        toast.error(error.message);
      }
    }
  };

  const handleEditStone = (
    row: number,
    col: number,
    editTool: BoardEditTool,
  ) => {
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
  };

  const handleClickBoard = (
    row: number,
    col: number,
    editTool?: BoardEditTool,
  ) => {
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
      throw Error("Unhandled board mode");
    }
  };

  const handleSelectNode = (node: SgfNode) => {
    if (readonly) {
      return;
    }
    setCurrentNode(node);
    setNextPlayer(getNextPlayer(node, true));
  };

  return {
    currentNode,
    setCurrentNode,

    nextPlayer,
    setNextPlayer,
    getNextPlayer,

    handleMove,
    handleSelectNode,
    handleEditStone,
    handleClickBoard,

    mode,
    setMode,

    editTool,
    setEditTool,
  };
}
