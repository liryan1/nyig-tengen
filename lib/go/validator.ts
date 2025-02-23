import { BOARD_SIZES } from "./constants";
import { GoGame } from "./goGame";
import { fromSgf, getBoardSize } from "./parser";

export function validateProblemInitial(sgf: string) {
  validateBoardSize(sgf);
  const n = fromSgf(sgf);
  if (n.children.length) {
    throw Error("Initial problem should have no variations");
  }
}

export function validateBoardSize(sgf: string) {
  const boardSize = getBoardSize(sgf);
  if (!boardSize || !BOARD_SIZES.includes(boardSize)) {
    throw Error("SGF Board size is invalid");
  }
}

export function validateProblemSolutions(sgf: string) {
  const goGame = GoGame.fromSgf(sgf);
  if (goGame.isEmpty() || !goGame.root.children.length) {
    throw Error("Solution must not be empty");
  }
}
