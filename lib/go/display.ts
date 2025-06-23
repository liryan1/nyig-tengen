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
