import { Visibility } from "@prisma/client";

export type StoneColor = -1 | 0 | 1;
export type Coord = [number, number];

/**
 * Snapshot of the board.
 * Records keys are coordinates (col, row) as in SGF format
 */
export interface BoardState {
  stones: Record<string, StoneColor>;
  labels: Record<string, string>;
  boardSize: number;
}

export interface ProblemStats {
  likes?: number;
  userLiked?: boolean;
  userStarred?: boolean;
  correctCount?: number;
  submissionCount?: number;
  views: number;
}

export interface GoProblemMeta {
  rank: number;
  description?: string;
  author: { id: string; name: string; role: string };
  stats?: ProblemStats;
  userSolved?: boolean;
  userMoves?: string[];
  endorser?: { id: string; name: string; rank?: string };
  visibility: Visibility;
  teams?: { team: string; slug: string }[];
}

export interface GoProblem {
  num: string;
  initial: string;
  correct?: string;
}

export type GoProblemResponse = GoProblem & GoProblemMeta;

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
  correctOpponentMove?: string;
}
