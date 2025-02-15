/**
 * Converts rank from digit to Go rank
 * @param rank -1 means 1kyu, 0 means 1dan. Valid range [-29, 8]
 * @param to1Decimal Convert to 1 decimal, for displaying average rank
 * @returns string
 */
export function getRank(rank: number, to1Decimal?: boolean) {
  const r = rank >= 0 ? rank + 1 : -rank;
  const kOrD = rank >= 0 ? "d" : "k";
  return `${to1Decimal ? r.toFixed(1) : r}${kOrD}`;
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
