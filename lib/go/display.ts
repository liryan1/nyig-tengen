export function getRank(rank: number, to1Decimal?: boolean) {
  if (rank < 0) {
    return `${to1Decimal ? (-rank).toFixed(1) : -rank}k`;
  }
  return `${to1Decimal ? rank.toFixed(1) : rank}d`;
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
