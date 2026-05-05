import { coordToIndices, SgfNode } from "./goGame";

/**
 * Converts rank from digit to Go rank
 * @param rank -1 means 1kyu, 0 means 1dan. Valid range [-30, 8]
 * @param to1Decimal Convert to 1 decimal, for displaying average rank
 * @returns string
 */
export function getRank(rank: number, to1Decimal?: boolean) {
  const r = rank >= 0 ? rank + 1 : -rank;
  const kOrD = rank >= 0 ? "d" : "k";
  return `${to1Decimal ? r.toFixed(1) : r}${kOrD}`;
}

/**
 * Parses Go rank string back into number format.
 * @param rankStr e.g., "3k", "1d", "1.5d"
 * @returns number: -1 for 1k, 0 for 1d, etc.
 */
export function parseRank(rankStr?: string, fallback: number = -10): number {
  const match = rankStr?.match(/^(\d+(\.\d+)?)([dk])$/i);
  if (!match) {
    return fallback;
  }

  const value = parseFloat(match[1]);
  const type = match[3].toLowerCase();

  if (type === "d") {
    return value - 1; // e.g., 1d => 0, 2.5d => 1.5
  } else {
    return -value; // e.g., 1k => -1, 3k => -3
  }
}

export function getPixelSize({
  cellSize,
  boardSize,
}: {
  cellSize: number;
  boardSize: number;
}) {
  const stoneSize = cellSize * 0.92;
  const margin = cellSize;
  const boardPixelSize = (boardSize - 1) * cellSize + margin * 2;
  return { stoneSize, margin, boardPixelSize };
}

export interface GoBoardCutoff {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Calculates the bounding box of a problem to display only the relevant part.
 * @param nodes SgfNode trees to analyze
 * @param boardSize Total board size (e.g. 19)
 * @param padding Number of empty lines to add around the stones
 * @returns GoBoardCutoff or undefined if no stones found or full board is needed
 */
export function getBoardCutoff(
  nodes: (SgfNode | undefined)[],
  boardSize: number,
  padding: number = 2,
): GoBoardCutoff | undefined {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  const process = (coord?: string) => {
    if (!coord || coord.length < 2) return;
    try {
      const { col, row } = coordToIndices(coord);
      minX = Math.min(minX, col);
      maxX = Math.max(maxX, col);
      minY = Math.min(minY, row);
      maxY = Math.max(maxY, row);
    } catch (e) {}
  };

  const traverse = (node: SgfNode) => {
    process(node.moveCoord);
    node.addBlack?.forEach(process);
    node.addWhite?.forEach(process);
    node.children.forEach(traverse);
  };

  nodes.forEach((n) => n && traverse(n));
  if (maxX === -Infinity) return undefined;

  const original = { minX, maxX, minY, maxY };
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;

  // Anchor logic: distance <= 2 lines from edge
  if (original.minX <= 2) minX = 0;
  if (original.maxX >= boardSize - 3) maxX = boardSize - 1;
  if (original.minY <= 2) minY = 0;
  if (original.maxY >= boardSize - 3) maxY = boardSize - 1;

  minX = Math.max(0, minX);
  maxX = Math.min(boardSize - 1, maxX);
  minY = Math.max(0, minY);
  maxY = Math.min(boardSize - 1, maxY);

  return minX === 0 &&
    maxX === boardSize - 1 &&
    minY === 0 &&
    maxY === boardSize - 1
    ? undefined
    : { minX, maxX, minY, maxY };
}

/**
 * Expands a cutoff to be square while staying within board boundaries.
 */
export function makeCutoffSquare(
  cutoff: GoBoardCutoff,
  boardSize: number,
): GoBoardCutoff {
  let { minX, maxX, minY, maxY } = cutoff;
  const w = maxX - minX;
  const h = maxY - minY;
  if (w === h) return cutoff;

  const target = Math.max(w, h);

  const expand = (min: number, max: number, current: number) => {
    const diff = target - current;
    let nextMin = min - Math.floor(diff / 2);
    let nextMax = max + Math.ceil(diff / 2);
    if (nextMin < 0) {
      nextMax -= nextMin;
      nextMin = 0;
    }
    if (nextMax >= boardSize) {
      nextMin -= nextMax - (boardSize - 1);
      nextMax = boardSize - 1;
    }
    return [Math.max(0, nextMin), Math.min(boardSize - 1, nextMax)];
  };

  if (w < target) [minX, maxX] = expand(minX, maxX, w);
  if (h < target) [minY, maxY] = expand(minY, maxY, h);

  return { minX, maxX, minY, maxY };
}
