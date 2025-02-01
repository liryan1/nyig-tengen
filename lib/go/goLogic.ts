import { StoneExistsError, SuicideError } from "./error";
import { BoardState, Coord, StoneColor } from "./interface";

export function create2dArray<T>(
  rows: number,
  cols?: number,
  fill?: T,
): BoardState {
  return Array.from(Array(rows), (_) => Array(cols ?? rows).fill(fill ?? 0));
}

export function deepCopy<T>(arr: T[][]): T[][] {
  return arr.map((inner) => inner.slice());
}

/**
 * Place a stone on the board (immutable update).
 * Checks if the move is allowed.
 * TODO: implement the ko rule
 * - row, col: Intersection to place the stone.
 * - color: StoneColor
 * - allowReplace: If true, replaces the stone at any position, i.e., edit mode
 * - returns a new BoardState with the stone placed and captured stones removed (if any).
 */
export function placeStone(
  board: BoardState,
  row: number,
  col: number,
  color: StoneColor,
  allowReplace: boolean = false,
): BoardState {
  if (
    isOutside(row, col, board.length) ||
    (!allowReplace && board[row][col] !== 0)
  ) {
    throw new StoneExistsError("Stone already exists at this position");
  }
  const newBoard = deepCopy(board);

  let replaceColor = color;
  if (allowReplace && newBoard[row][col] === color) {
    // Remove the stone in replace mode if stone already exists, otherwise, overwrite
    replaceColor = 0;
  }

  newBoard[row][col] = replaceColor;
  // Check for dead groups of the opponents color
  const opponentColor = getNextColor(color);
  let dead: Coord[] = [];
  addNeighbors(row, col).forEach((neighbor) => {
    dead = dead.concat(
      getDeadGroup(newBoard, neighbor[0], neighbor[1], opponentColor),
    );
  });
  // Check if this move creates any own dead groups
  const suicide: [number, number][] = getDeadGroup(newBoard, row, col, color);
  if (dead.length === 0 && suicide.length > 0) {
    throw new SuicideError("One cannot suicide in Go");
  }
  return removeDeadGroup(newBoard, dead);
}

export function getNextColor(currentColor: StoneColor): StoneColor {
  if (currentColor === 0) {
    return 0;
  }
  return currentColor === -1 ? 1 : -1;
}

export function getColorLabel(color: StoneColor) {
  if (color === 0) {
    return "Empty";
  }
  return color === 1 ? "Black" : "White";
}

export function getRank(rank: number, to1Decimal?: boolean) {
  if (rank < 0) {
    return `${to1Decimal ? (-rank).toFixed(1) : -rank}k`;
  }
  return `${to1Decimal ? rank.toFixed(1) : rank}d`;
}

function isOutside(row: number, col: number, size: number = 19) {
  return !(0 <= row && row < size && 0 <= col && col < size);
}

/**
 * Gets all the neighboring coordinates of row, col
 */
function addNeighbors(row: number, col: number) {
  const y_dir: number[] = [0, 1, 0, -1];
  const x_dir: number[] = [1, 0, -1, 0];
  const neighbors: Coord[] = [];
  for (let i = 0; i < 4; i++) {
    const newCoord = [row + x_dir[i], col + y_dir[i]] as Coord;
    neighbors.push(newCoord);
  }
  return neighbors;
}

function changeStatus(
  board: BoardState,
  row: number,
  col: number,
  value: StoneColor,
) {
  const newBoard = deepCopy(board);
  newBoard[row][col] = value;
  return newBoard;
}

function getDeadGroup(
  board: BoardState,
  row: number,
  col: number,
  color: StoneColor,
): Coord[] {
  let boardCopy: BoardState = deepCopy(board);
  const opponentColor = getNextColor(color);
  const size = board.length;
  let stack: Coord[] = [[row, col]];
  const deadGroup: Coord[] = [];

  let idx = 0;

  while (stack) {
    const c = stack.pop();
    if (!c) {
      break;
    }
    if (
      isOutside(c[0], c[1], size) ||
      boardCopy[c[0]][c[1]] === opponentColor
    ) {
      continue;
    } else if (boardCopy[c[0]][c[1]] === color) {
      deadGroup.push(c);
      stack = stack.concat(addNeighbors(c[0], c[1]));
      boardCopy = changeStatus(boardCopy, c[0], c[1], opponentColor);
      idx += 1;
    } else {
      return [];
    }
  }

  return deadGroup;
}

function removeDeadGroup(board: BoardState, group: Coord[]) {
  const newBoard = deepCopy(board);
  for (let i = 0; i < group.length; i++) {
    newBoard[group[i][0]][group[i][1]] = 0;
  }
  return newBoard;
}
