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
import toast from "react-hot-toast";

export type Mode = "move" | "edit";

export interface UseGoProps {
  readonly?: boolean;
  goGame: GoGame;
}

export function useGo({ goGame, readonly }: UseGoProps) {
  const [currentNode, setCurrentNode] = useState<SgfNode>(goGame.root);
  const [nextPlayer, setNextPlayer] = useState<StoneColor>(1);
  const [mode, setMode] = useState<Mode>("move");

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
    setMode("move");
  };

  const handleEditStone = (row: number, col: number) => {
    // If there is a parent, then we're not on the root node
    if (readonly || currentNode.parent) {
      return;
    }
    const coord = indicesToCoord(row, col);
    const boardState = goGame.getBoardState(currentNode);
    const stone = boardState.stones[coord];

    if (!currentNode.moveColor) {
      let edit: EditProps =
        nextPlayer === -1 ? { addWhite: [coord] } : { addBlack: [coord] };
      if (stone === nextPlayer) {
        edit = { removeStones: [coord] };
      }
      const newNode = goGame.editOnRoot(edit);
      setCurrentNode(newNode);
    }
  };

  const handleClickBoard = (row: number, col: number) => {
    if (readonly) {
      return;
    }
    if (mode === "move") {
      handleMove(row, col);
    } else if (mode === "edit") {
      handleEditStone(row, col);
    } else {
      throw Error("Unhandled board mode");
    }
  };

  const handleSelectNode = (node: SgfNode) => {
    if (readonly) {
      return;
    }
    setCurrentNode(node);
    if (node.moveColor) {
      setNextPlayer(getNextColor(node.moveColor));
    } else {
      let curr = node.parent;
      let color = curr?.moveColor;
      while (curr && !color) {
        curr = curr.parent;
        color = curr?.moveColor;
      }
      if (!color) {
        // We're at the root node, set color as black
        color = -1;
      }
      setNextPlayer(getNextColor(color));
    }
    setMode("move");
  };

  return {
    currentNode,
    setCurrentNode,
    nextPlayer,
    setNextPlayer,
    handleMove,
    handleSelectNode,

    mode,
    setMode,
    handleEditStone,

    handleClickBoard,
  };
}
