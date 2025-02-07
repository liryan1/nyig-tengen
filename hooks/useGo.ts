"use client";

import { KoError, SuicideError } from "@/lib/go/error";
import { getNextColor, GoGame, indicesToCoord, SgfNode } from "@/lib/go/goGame";
import { StoneColor } from "@/lib/go/interface";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

export interface UseGoProps {
  boardSize?: number;
  readonly?: boolean;
  root?: SgfNode;
}

export function useGo({ boardSize, readonly, root }: UseGoProps) {
  const goLogicRef = useRef<GoGame | null>(null);
  if (goLogicRef.current === null) {
    goLogicRef.current = new GoGame({ boardSize, root });
  }
  const goLogic = goLogicRef.current;
  const [currentNode, setCurrentNode] = useState<SgfNode>(
    goLogicRef.current.root,
  );
  const [nextPlayer, setNextPlayer] = useState<StoneColor>(1);
  const [mode, setMode] = useState("move");

  const handleMove = (row: number, col: number, node?: SgfNode) => {
    const logic = goLogicRef.current;
    if (readonly || !logic) return;

    const coord = indicesToCoord(row, col);

    try {
      const newNode = logic.playMove(node ?? currentNode, nextPlayer, coord);
      setCurrentNode(newNode);
      setNextPlayer(getNextColor(nextPlayer));
    } catch (error) {
      if (error instanceof SuicideError || error instanceof KoError) {
        toast.error(error.message);
      }
    }
  };

  const handleEdit = (row: number, col: number) => {
    const logic = goLogicRef.current;
    if (readonly || !logic) return;

    const coord = indicesToCoord(row, col);
    const boardState = logic.getBoardState(currentNode);
    const stone = boardState.stones[coord];

    // Create an edit node
    if (stone) {
      // Remove the stone
      const newNode = logic.makeEdits(currentNode, {
        removeStones: [coord],
      });
      setCurrentNode(newNode);
    } else {
      // Add a black stone (you can customize to white or choose a color)
      const newNode = logic.makeEdits(currentNode, {
        addBlack: [coord],
      });
      setCurrentNode(newNode);
    }
  };

  const handleClickBoard = (row: number, col: number) => {
    if (mode === "move") {
      handleMove(row, col);
    } else {
      handleEdit(row, col);
    }
  };

  const handleSelectNode = (node: SgfNode) => {
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
    goLogic,
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
