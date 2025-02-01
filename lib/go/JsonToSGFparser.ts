import {
  BoardState,
  GoProblem,
  Move,
  StoneColor,
  Variation,
} from "./interface";

/**
 * A simple tree structure for building variations with shared prefixes.
 */
interface VariationNode {
  move?: Move; // The move that led to this node
  children: VariationNode[]; // Continuations from this move
}

/**
 * Convert a single GoProblem into an SGF string. LLM generated but tested.
 */
export function convertProblemsToSGF(
  problems: GoProblem[],
  options?: {
    boardSize?: number; // e.g. 9, 19, etc.
    komi?: number; // default 7.5
    rules?: string; // default 'AGA'
    date?: string; // default today's date
    appName?: string; // default 'NYIGTengen'
  },
): string {
  const {
    boardSize = problems[0]?.initial?.board?.length || 19,
    komi = 7.5,
    rules = "AGA",
    date = new Date().toISOString().split("T")[0],
    appName = "NYIGTengen",
  } = options || {};

  // Standard SGF header
  let sgf = `(;GM[1]FF[4]CA[UTF-8]AP[${appName}]ST[2]`;
  sgf += `RU[${rules}]SZ[${boardSize}]KM[${komi}]`;
  sgf += `DT[${date}]`;

  for (const problem of problems) {
    sgf += buildSGFProblemString(problem);
  }

  // Close the root node
  sgf += ")";

  return sgf;
}

function buildSGFProblemString(problem: GoProblem) {
  let sgf = "(";
  sgf += buildBoardSetup(problem.initial.board);
  const tree = buildVariationTree(problem.correct);
  // Determine who moves next: opposite of 'problem.initial.color'
  // color = -1 means White just played => next is Black => color = 1
  // color = 1 means Black just played => next is White => color = -1
  const nextColor = (problem.initial.color * -1) as StoneColor;
  sgf += buildSGFVariationString(tree, nextColor);
  return sgf + ")";
}

/**
 * Recursively build the SGF moves from a VariationNode.
 *
 * @param node   The node whose children we are to serialize.
 * @param color  Whose turn it is to play:  1 for black ('B'), -1 for white ('W').
 * @returns      SGF string representation of the child variations.
 */
function buildSGFVariationString(
  node: VariationNode,
  color: StoneColor,
): string {
  if (node.children.length === 0) {
    return ""; // no further moves
  }

  // If multiple children, we must create multiple SGF branches.
  if (node.children.length > 1) {
    // Each child is put in its own ( ;move ... ) block
    return node.children
      .map((child) => {
        const moveCoord = toSGFCoord(child.move![0], child.move![1]);
        const moveColor = color === 1 ? "B" : "W";
        const subtree = buildSGFVariationString(
          child,
          (color * -1) as StoneColor,
        );
        return `(;${moveColor}[${moveCoord}]${subtree})`;
      })
      .join("");
  } else {
    // Exactly one child -> continue in the same variation (no extra parentheses)
    const child = node.children[0];
    const moveCoord = toSGFCoord(child.move![0], child.move![1]);
    const moveColor = color === 1 ? "B" : "W";
    const subtree = buildSGFVariationString(child, (color * -1) as StoneColor);
    return `;${moveColor}[${moveCoord}]${subtree}`;
  }
}

/**
 * Utility to convert a board coordinate (row, col) -> SGF coordinate string.
 * By convention in SGF, the first letter is the column, the second is the row.
 * 'a' -> 0, 'b' -> 1, 'c' -> 2, ...
 */
function toSGFCoord(row: number, col: number): string {
  const colLetter = String.fromCharCode("a".charCodeAt(0) + col);
  const rowLetter = String.fromCharCode("a".charCodeAt(0) + row);
  return `${colLetter}${rowLetter}`;
}

/**
 * Build the SGF "board setup" string from the initial BoardState.
 * - White stones: AW[..]
 * - Black stones: AB[..]
 *
 * Example: ";AW[cc][ce][de]AB[cf][cg][ch]"
 */
function buildBoardSetup(board: BoardState): string {
  const size = board.length;
  const blackStones: string[] = [];
  const whiteStones: string[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = board[r][c];
      if (val === 1) {
        // Black stone
        blackStones.push(`[${toSGFCoord(r, c)}]`);
      } else if (val === -1) {
        // White stone
        whiteStones.push(`[${toSGFCoord(r, c)}]`);
      }
    }
  }

  let setup = "";
  if (whiteStones.length > 0) {
    setup += `;AW${whiteStones.join("")}`;
  }
  if (blackStones.length > 0) {
    setup += `AB${blackStones.join("")}`;
  }
  return setup;
}

/**
 * Build a prefix tree from all correct variations.
 * Common initial moves in the sequences share the same path in the tree.
 */
function buildVariationTree(variations: Variation[]): VariationNode {
  // Root node has no "move" itself, but holds children
  const root: VariationNode = { children: [] };

  for (const variation of variations) {
    let current = root;
    for (const mv of variation) {
      // See if there's already a child with this move
      let child = current.children.find(
        (ch) => ch.move && ch.move[0] === mv[0] && ch.move[1] === mv[1],
      );
      if (!child) {
        child = { move: mv, children: [] };
        current.children.push(child);
      }
      current = child;
    }
  }

  return root;
}
