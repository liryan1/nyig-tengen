"use client";

import { KoError, SuicideError } from "@/lib/go/error";
import { getNextColor, GoGame, indicesToCoord, SgfNode } from "@/lib/go/goGame";
import { StoneColor } from "@/lib/go/interface";
import { useState } from "react";
import toast from "react-hot-toast";

export interface UseGoProps {
  readonly?: boolean;
  goGame: GoGame;
}

export function useGo({ goGame, readonly }: UseGoProps) {
  const [currentNode, setCurrentNode] = useState<SgfNode>(goGame.root);
  const [nextPlayer, setNextPlayer] = useState<StoneColor>(1);
  const [mode, setMode] = useState("move");

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

  const handleEdit = (row: number, col: number) => {
    if (readonly) {
      return;
    }
    const coord = indicesToCoord(row, col);
    const boardState = goGame.getBoardState(currentNode);
    const stone = boardState.stones[coord];

    // Create an edit node
    if (stone) {
      // Remove the stone
      const newNode = goGame.makeEdits(currentNode, {
        removeStones: [coord],
      });
      setCurrentNode(newNode);
    } else {
      // Add a black stone (you can customize to white or choose a color)
      const newNode = goGame.makeEdits(currentNode, {
        addBlack: [coord],
      });
      setCurrentNode(newNode);
    }
  };

  const handleClickBoard = (row: number, col: number) => {
    if (readonly) {
      return;
    }
    if (mode === "move") {
      handleMove(row, col);
    } else {
      handleEdit(row, col);
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
    handleClickBoard,
  };
}
