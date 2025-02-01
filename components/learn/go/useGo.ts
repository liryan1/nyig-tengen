import { useEffect, useState } from "react";
import { create2dArray, getNextColor, placeStone } from "@/lib/go/goLogic";
import { BoardHistory, BoardState, StoneColor } from "@/lib/go/interface";
import { SuicideError } from "@/lib/go/error";
import toast from "react-hot-toast";

const defaultBoardHistory: BoardHistory[] = [
  {
    board: create2dArray(19),
    color: -1,
  },
];

interface UseGoProps {
  /**
   * Initial board history array, updated if user enters moves on the board
   * @default defaultBoardHistory
   */
  iBoardHistory?: BoardHistory[];
  /**
   * Whether to show coordinates on the board initially
   * @default false
   */
  iShowCoord?: boolean;
  /**
   * Which move to display on
   * @default 0
   */
  iCurrentMove?: number;
  /**
   * Maximum cell size in pixels of each grid of the board
   */
  maxCellSize: number;
  /**
   * Ref to the parent container in which the Go board is rendered.
   * If provided, we measure its width for responsiveness.
   */
  boardContainerRef?: React.RefObject<HTMLDivElement | null>;
}

interface UseGoReturn {
  /**
   * Board history array, updated if user enters moves on the board
   */
  boardHistory: BoardHistory[];
  /**
   * Current move number
   */
  currentMove: number;
  /**
   * Color of the next player to move
   */
  nextPlayer: StoneColor;
  /**
   * Size of each cell in pixels
   */
  cellSize: number;
  /**
   * Size of the board, e.g., 9 for a 9x9 board
   */
  boardSize: number;
  /**
   * Size of the board in pixels, includes margins
   */
  boardPixelSize: number;
  /**
   * Callback for playing the next move at row, col, color
   * Index is optional to play move at a particular index. This overwrites existing
   * sequences after the index.
   */
  playMove: (
    row: number,
    col: number,
    color: StoneColor,
    index?: number,
  ) => void;
  /**
   * Sets the currentMove to `move`.
   */
  goToMove: (move: number) => void;
}

/**
 * Hook for handling Go game in react components
 * @param UseGoProps
 * @returns UseGoReturn
 */
export function useGo({
  maxCellSize,
  boardContainerRef,
  iBoardHistory = defaultBoardHistory,
  iCurrentMove = 0,
}: UseGoProps): UseGoReturn {
  const [boardHistory, setBoardHistory] =
    useState<BoardHistory[]>(iBoardHistory);
  const [currentMove, setCurrentMove] = useState<number>(iCurrentMove);
  const [nextPlayer, setNextPlayer] = useState<StoneColor>(1);
  const [cellSize, setCellSize] = useState(maxCellSize);
  const boardSize = boardHistory[0]?.board?.length ?? 0;
  const boardPixelSize = (boardSize - 1) * cellSize + cellSize * 2; // Includes margins

  useEffect(() => {
    // On small screens, fill available width minus small margins.
    // On larger screens, don't exceed a chosen maxCellSize.
    function handleResize() {
      let width = boardContainerRef?.current?.clientWidth;
      if (!width) {
        // Fallback to use screenwidth for resizing
        const w = window.innerWidth;
        // Some hardcoded numbers here for tailwind breakpoints set at page level
        width = w * (w < 640 ? 0.95 : w < 768 ? 0.9 : w < 1024 ? 0.85 : 0.8);
      }
      // We never want the width to be greater than the screen width, so take the min first
      // before doing the floor calculation
      const dynamicSize =
        Math.min(window.innerWidth, width * 0.98) / (boardSize + 1);
      setCellSize(Math.min(dynamicSize, maxCellSize));
    }
    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [boardSize]);

  // Plays a move of color on the current go board and appends to the
  // Go history array
  const playMove = (
    row: number,
    col: number,
    color: StoneColor,
    index?: number,
  ) => {
    const move = index ?? currentMove;
    let newBoard: BoardState;
    try {
      newBoard = placeStone(boardHistory[move].board, row, col, color);
    } catch (error) {
      if (error instanceof SuicideError) {
        toast.error("Suicide moves are not allowed!");
      }
      return; // Move cannot be played, don't update history
    }

    // If we had undone some moves, we remove future steps
    const newHistory = boardHistory.slice(0, move + 1);

    newHistory.push({ board: newBoard, color, move: [row, col] });
    setBoardHistory(newHistory);
    setCurrentMove(newHistory.length - 1);
    setNextPlayer(getNextColor(color));
  };

  // Go to the move at index. Going past begin and end of the history array
  // is handled by truncating to 0 or array.length
  const goToMove = (moveIndex: number) => {
    const i = getClosestIndex(boardHistory, moveIndex);
    setCurrentMove(i);
    // The color in boardHistory[moveIndex] is the color that produced this board,
    // so nextPlayer is whichever color is next after that move:
    const colorAtMove = boardHistory[moveIndex].color;
    setNextPlayer(getNextColor(colorAtMove));
  };

  return {
    goToMove,
    currentMove,
    playMove,
    boardHistory,
    nextPlayer,

    cellSize,
    boardSize,
    boardPixelSize,
  };
}

function getClosestIndex<T>(arr: T[], index: number): number {
  if (index < 0) {
    return 0;
  } else if (index >= arr.length) {
    return arr.length - 1;
  }
  return index;
}
