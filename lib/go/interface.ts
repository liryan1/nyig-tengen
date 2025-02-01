export type StoneColor = -1 | 0 | 1;
export type BoardState = StoneColor[][]; // row, col
export type Coord = [number, number];

/**
 * A board snapshot with the board state, color of the move last played,
 * and the move previously played to produce this board
 */
export type BoardHistory = {
  board: BoardState;
  /**
   * The color that just played to produce this board
   */
  color: StoneColor;
  /**
   * The move that produced this board
   */
  move?: [number, number];
};

/** Go Move at row, column */
export type Move = Coord;
/**
 * Sequence of moves that make up a variation
 */
export type Variation = Move[];

export interface ProblemStats {
  likes?: number;
  correctCount?: number;
  submissionCount?: number;
  views: number;
}

export interface ProblemResponse extends GoProblem {
  id: string;
  description?: string;
  problemStats?: ProblemStats;
  rank: number;
  author: { name: string; id: string };
  problemSet?: { name: string; id: string };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Defines a Go problem, including the board history, correct sequences, and optional incorrect sequences.
 */
export interface GoProblem {
  /** initial.color is "whoever played last", so it is the opposite of who plays first */
  initial: BoardHistory;

  /** Possible correct sequences (each is an array of moves, e.g. [[row, col], ...]) */
  correct: Variation[]; // e.g. an array of arrays of [row, col]
}

/**
 * User submission evaluation against the problems answers
 */
export interface Evaluation {
  /**
   * Status of the user's moves against the correct solution
   * "solved" - other fields are undefined
   * "mismatch" - at least one of the player's moves does not match with the solution
   * "partial" - all player's moves match with the solution, but player ended early
   */
  status: "solved" | "mismatch" | "partial";
  /**
   * furthest index that does not match compared with all the answers
   * -1 is returned if the status is "solved"
   */
  mismatchIndex: number;
  /**
   * If the user submitted a mismatched opponent move, this contains
   * the move the opponent should have played instead
   */
  correctOpponentMove?: Move;
}
