import { Evaluation, ProblemResponse, Move, Variation } from "./interface";

/**
 * Evaluate a user-submitted sequence against multiple solution lines,
 * returning the "best match" (furthest correct prefix) across all lines.
 */
export function evaluateUserSequence(
  userMoves: Move[],
  solutionLines: Variation[],
): Evaluation {
  // If no solution lines exist, it's always "wrong"
  if (!solutionLines || solutionLines.length === 0) {
    return { status: "partial", mismatchIndex: 0 };
  }

  // We'll track the best result across all solution lines
  const lineResults: Evaluation[] = [];

  // Helper to compare two results and pick the one with the furthest mismatchIndex
  function pickBetterResult(r1: Evaluation, r2: Evaluation): Evaluation {
    // "solved" is always best
    if (r1.status === "solved") return r1;
    if (r2.status === "solved") return r2;

    // Compare mismatchIndex. Higher is better for partial or mismatch
    const i1 = r1.mismatchIndex ?? 0;
    const i2 = r2.mismatchIndex ?? 0;
    if (i2 > i1) return r2;
    return r1;
  }

  for (const solLine of solutionLines) {
    let mismatchIndex = -1;
    let i = 0;

    for (; i < Math.min(userMoves.length, solLine.length); i++) {
      const userM = userMoves[i];
      const solM = solLine[i];
      if (userM[0] !== solM[0] || userM[1] !== solM[1]) {
        mismatchIndex = i;
        break;
      }
    }

    // Construct a local result for this line
    let lineResult: Evaluation;

    if (mismatchIndex === -1 && userMoves.length === solLine.length) {
      // Perfect match => user solved the puzzle
      return { status: "solved", mismatchIndex: -1 };
    } else if (mismatchIndex === -1 && userMoves.length < solLine.length) {
      // partial correct so far, user ended early
      // i is how many moves matched, which equals userMoves.length
      lineResult = {
        status: "partial",
        mismatchIndex: userMoves.length,
      };
    } else if (mismatchIndex !== -1) {
      // On mismatch, check if it was their own move or opponent's move.
      // Odd mismatch index means opponent move is wrong, return the potential correct move
      // even means own move was wrong, leave this field empty.
      let correctOpponentMove = undefined;
      if (mismatchIndex & 1) {
        correctOpponentMove = solLine[mismatchIndex];
      }
      lineResult = {
        status: "mismatch",
        mismatchIndex,
        correctOpponentMove,
      };
    } else if (mismatchIndex === -1 && userMoves.length > solLine.length) {
      // User matched the entire solution line but played extra moves.
      // We still consider this "solved", with mismatchIndex = userMoves.length
      lineResult = {
        status: "solved",
        mismatchIndex: userMoves.length,
      };
    } else {
      throw Error("Unhandled situation");
    }

    // If the local result is "solved", return immediately
    if (lineResult.status === "solved") {
      return lineResult;
    }

    // Otherwise, add the potentially good results
    lineResults.push(lineResult);
  }

  // After we finish checking all lines, figure out the best mismatchIndex
  // 1) Find the maximum mismatchIndex
  let maxIndex = 0;
  for (const r of lineResults) {
    if (r.mismatchIndex > maxIndex) {
      maxIndex = r.mismatchIndex;
    }
  }
  // 2) Filter to only results matching that maxIndex
  const bestCandidates = lineResults.filter(
    (r) => r.mismatchIndex === maxIndex,
  );
  // 3) Randomly pick one from bestCandidates
  const randomIndex = Math.floor(Math.random() * bestCandidates.length);
  return bestCandidates[randomIndex];
}

export function validateProblemData(data?: ProblemResponse): boolean {
  if (!data) {
    throw Error("No data");
  }
  if (!data.initial) {
    throw Error("No data or initial problem position");
  }
  if (!data.correct?.length) {
    throw Error("No correct solution lines");
  }
  data.correct.forEach((solLine, i) => {
    if (!solLine.length) {
      throw Error(`Solution line ${i + 1} is empty`);
    }
    if (!(solLine.length & 1)) {
      throw Error(
        `Solution line ${i + 1} does not end with the starting color`,
      );
    }
  });
  return true;
}

export interface EvaluationStats {
  submissionCount: { increment: number };
  correctCount?: { increment: number };
}

export function evaluate(userMoves: Variation, correctSequences: unknown) {
  // Evaluate the user's submission against the correct solutions
  const evaluation: Evaluation = evaluateUserSequence(
    userMoves,
    correctSequences as Variation[],
  );

  // Update problem stats: submissionCount always increments, correctCount if solved
  const stats: EvaluationStats = {
    submissionCount: {
      increment: 1,
    },
  };

  if (evaluation.status === "solved") {
    stats.correctCount = { increment: 1 };
  }
  return { stats, evaluation };
}
