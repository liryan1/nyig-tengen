import { SgfNode } from "@/lib/go/goGame";
import { Evaluation } from "@/lib/go/interface";

export interface EvaluationStats {
  submissionCount?: { increment: number };
  correctCount?: { increment: number };
}

export function getMoves(node: SgfNode) {
  const moves: string[] = [];
  let currentNode: SgfNode | undefined = node;
  while (currentNode) {
    if (currentNode.moveCoord !== undefined) {
      moves.push(currentNode.moveCoord);
    }
    currentNode = currentNode.parent;
  }
  return moves.toReversed();
}

export function getEvaluation(
  userMoves: string[],
  solutionTree: SgfNode,
): Evaluation {
  let currentNode = solutionTree;
  let i = 0;
  while (currentNode.children?.length && i < userMoves.length) {
    const userMove = userMoves[i];
    const nextNode = currentNode.children.find(
      (node) => node.moveCoord === userMove,
    );

    if (!nextNode) {
      // Mismatch detected
      const isPlayersMove = i % 2 === 0; // Even index => player's move, Odd index => opponent's move
      if (isPlayersMove) {
        return { status: "mismatch", mismatchIndex: i };
      } else {
        // Find the correct opponent move
        const correctMove =
          currentNode.children.length > 0
            ? currentNode.children[0].moveCoord
            : undefined;
        return {
          status: "mismatch",
          mismatchIndex: i,
          correctOpponentMove: correctMove,
        };
      }
    }

    currentNode = nextNode;
    i++;
  }

  // Compare i and user Moves
  // 1. User moves shorter than the answer but so far it is correct
  // 2. User moves was equal to or longer than the answer
  if (currentNode.children?.length) {
    return { status: "partial", mismatchIndex: i };
  } else {
    return { status: "solved", mismatchIndex: i };
  }
}

export function evaluate(userMoves: string[], solutionTree: SgfNode) {
  // Evaluate the user's submission against the correct solutions
  const evaluation: Evaluation = getEvaluation(userMoves, solutionTree);

  // Update problem stats: submissionCount always increments, correctCount if solved
  const stats: EvaluationStats = {};
  // Partial solutions are part of good solutions, so we don't increment submissionCount
  if (evaluation.status !== "partial") {
    stats.submissionCount = { increment: 1 };
  }

  if (evaluation.status === "solved") {
    stats.correctCount = { increment: 1 };
  }
  return { stats, evaluation };
}
