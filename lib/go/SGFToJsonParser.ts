import {
  BoardState,
  GoProblem,
  Move,
  StoneColor,
  Variation,
} from "./interface";

/* -------------- Internal SGF data structures for standard parse ---------- */
interface SgfGameTree {
  sequence: SgfNode[]; // linear chain of nodes
  children: SgfGameTree[]; // sub-variations branching off
}

interface SgfNode {
  properties: Record<string, string[]>;
}

/* -------------------------------------------------------------------------
   1) Parse the entire SGF string into a list of SgfGameTree
      (standard: An SGF file can contain multiple "GameTrees",
       known collectively as a "Collection".)

   2) Usually your forward code lumps everything into *one* root tree,
      with each problem as a child. We'll see that root tree has a
      sequence[0] containing properties like GM,FF, etc., and then each
      child is a separate "problem" subtree.

   3) We'll then convert each child tree into a GoProblem.
------------------------------------------------------------------------- */
export function convertSGFToProblems(sgf: string): GoProblem[] {
  // Parse entire SGF file into a "collection" of game trees
  const collection = parseCollection(sgf);

  // In your forward code, there is exactly one root tree that has:
  //  - a sequence with 1 node containing GM,FF,SZ, etc.
  //  - multiple children, each child is a "problem"
  // If there's more than one game tree at the top level, handle them all
  const problems: GoProblem[] = [];

  for (const rootTree of collection) {
    // The forward code lumps problems in rootTree.children
    // The root node might have "SZ" for board size, etc.
    const boardSize = parseBoardSize(rootTree.sequence[0]);

    // For each child, treat it as a separate problem:
    //   - child.sequence[0] will have AW/AB for initial stones
    //   - then we gather the moves from child.sequence (all nodes) + sub-variations
    for (const problemTree of rootTree.children) {
      const problem = parseProblemTree(problemTree, boardSize);
      problems.push(problem);
    }
  }

  return problems;
}

/* ------------------- Parse one "problem" subtree -------------------------
   "problemTree" typically:
     sequence[0].properties => AW[..], AB[..]
     the rest of the sequence => moves
     children => sub-branches
 -------------------------------------------------------------------------- */
function parseProblemTree(problemTree: SgfGameTree, size: number): GoProblem {
  // 1) Create an empty board
  const board = createEmptyBoard(size);

  // 2) The first node in problemTree.sequence has AB[..], AW[..] for initial placement
  const setupNode = problemTree.sequence[0] || { properties: {} };
  const awList = setupNode.properties["AW"] ?? [];
  const abList = setupNode.properties["AB"] ?? [];

  for (const coord of awList) {
    const [r, c] = fromSGFCoord(coord);
    board[r][c] = -1; // White stone
  }
  for (const coord of abList) {
    const [r, c] = fromSGFCoord(coord);
    board[r][c] = 1; // Black stone
  }

  // 3) Decide which color was last to play based on counts
  let blackCount = 0,
    whiteCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 1) blackCount++;
      else if (board[r][c] === -1) whiteCount++;
    }
  }
  const lastColor: StoneColor = whiteCount > blackCount ? -1 : 1;

  // 4) Gather all full move-sequences from the problemTree,
  //    ignoring the first node's AW/AB as "setup" but including
  //    any moves in that node. Then continue through the entire
  //    sequence + sub-variations.
  // We do a DFS over the entire tree, building each path from the start node
  const allVariations: Variation[] = [];
  // Start from an empty path of moves
  collectVariationsFromGameTree(problemTree, [], allVariations);

  // Return the final GoProblem
  return {
    initial: { board, color: lastColor },
    correct: allVariations,
  };
}

/* --------------- Recursively gather full sequences (DFS) -----------------
   Because each SgfGameTree has:
     - sequence: an array of nodes in a row
     - children: an array of SgfGameTrees that branch off the end

   We'll walk node by node in the sequence, collecting any moves (B[]/W[]),
   then descend into each child for branching.
 -------------------------------------------------------------------------- */
function collectVariationsFromGameTree(
  tree: SgfGameTree,
  prefixMoves: Move[],
  outVariations: Variation[],
) {
  // For each node in sequence, parse out any moves. In your forward code,
  // each node generally has at most one B[..] or W[..], but let's handle
  // multiple or none just to be safe.
  let currentMoves = [...prefixMoves];

  for (const node of tree.sequence) {
    // If there's a black move in this node
    const bMoves = node.properties["B"] || [];
    // If there's a white move in this node
    const wMoves = node.properties["W"] || [];

    // Typically you only have one B or W, but let's handle multiple
    if (bMoves.length > 0) {
      // each B[] is a separate possibility (rare in your generation)
      // we can either treat it as branching or assume only one entry
      // For clarity, if there's more than one in a node, treat it as separate branches
      // but the simpler approach is: if your generator only puts one, just parse the first
      for (let i = 0; i < bMoves.length; i++) {
        if (i === 0) {
          const move = fromSGFCoord(bMoves[i]);
          currentMoves.push(move);
        } else {
          // A new "parallel" branch for the extra move
          const branchMoves = [...currentMoves, fromSGFCoord(bMoves[i])];
          // Then from here, we'd collect children
          for (const child of tree.children) {
            collectVariationsFromGameTree(child, branchMoves, outVariations);
          }
          // Because we had an extra branch from the same node, we won't continue
          // into the next node of the sequence with that branch. It's complicated
          // but let's keep it simple (in practice you usually see only one B[]/W[]).
        }
      }
    } else if (wMoves.length > 0) {
      for (let i = 0; i < wMoves.length; i++) {
        if (i === 0) {
          const move = fromSGFCoord(wMoves[i]);
          currentMoves.push(move);
        } else {
          // same parallel branch logic
          const branchMoves = [...currentMoves, fromSGFCoord(wMoves[i])];
          for (const child of tree.children) {
            collectVariationsFromGameTree(child, branchMoves, outVariations);
          }
        }
      }
    }
    // If no B/W property, then it might be just a "setup node" with e.g. AW/AB.
    // We'll continue. The next node in the sequence is still part of the same variation.
  }

  // After finishing all nodes in "tree.sequence", we can branch into each child.
  // Each child is a separate "GameTree" that continues from the final position
  // of the last node in this sequence.
  if (tree.children.length === 0) {
    // Leaf => store the entire path as one variation
    outVariations.push(currentMoves);
  } else {
    // There's at least one child => each child extends the path
    for (const child of tree.children) {
      // Pass a fresh copy of currentMoves (to avoid mutating it in recursion)
      collectVariationsFromGameTree(child, [...currentMoves], outVariations);
    }
  }
}

/* ------------------------- SGF Parsing (Core) ----------------------------
   We implement the standard grammar (simplified):

   Collection = GameTree+
   GameTree   = "(" Sequence { GameTree } ")"
   Sequence   = Node+
   Node       = ";" Property*
   Property   = PropIdent PropValue+
   PropIdent  = [A-Za-z]+
   PropValue  = "[" (escaped string) "]"

   This ensures consecutive `;` nodes become a continuous "Sequence" array.
------------------------------------------------------------------------- */
function parseCollection(sgf: string): SgfGameTree[] {
  // Remove BOM, newlines, trim
  sgf = sgf
    .replace(/\ufeff/g, "")
    .replace(/\s+/g, " ")
    .trim();

  let i = 0;
  const trees: SgfGameTree[] = [];

  // A "Collection" can have multiple GameTrees in sequence
  while (i < sgf.length) {
    skipSpaces();
    if (sgf[i] === "(") {
      trees.push(parseGameTree());
    } else {
      // unexpected char => break
      break;
    }
  }
  return trees;

  function parseGameTree(): SgfGameTree {
    consume("(");
    const sequence = parseSequence();
    // After the sequence, we may have zero or more sub-GameTrees
    const children: SgfGameTree[] = [];
    skipSpaces();
    while (sgf[i] === "(") {
      children.push(parseGameTree());
      skipSpaces();
    }
    consume(")");
    return { sequence, children };
  }

  function parseSequence(): SgfNode[] {
    // Must have at least one Node
    const nodes: SgfNode[] = [];
    while (true) {
      skipSpaces();
      if (sgf[i] === ";") {
        consume(";");
        const node = parseNode();
        nodes.push(node);
      } else {
        break; // end of sequence
      }
    }
    return nodes;
  }

  function parseNode(): SgfNode {
    // A node can have zero or more properties
    const node: SgfNode = { properties: {} };
    skipSpaces();
    while (true) {
      skipSpaces();
      // property label is letters
      const labelMatch = /^[A-Za-z]+/.exec(sgf.slice(i));
      if (!labelMatch) break; // no more properties
      const label = labelMatch[0];
      i += label.length;
      skipSpaces();

      // read one or more [value] blocks
      if (!node.properties[label]) {
        node.properties[label] = [];
      }
      while (sgf[i] === "[") {
        consume("[");
        let val = "";
        while (true) {
          if (i >= sgf.length) {
            throw new Error("Unclosed '[' in SGF");
          }
          if (sgf[i] === "\\") {
            // escape next char
            i++;
            if (i < sgf.length) {
              val += sgf[i];
              i++;
            }
          } else if (sgf[i] === "]") {
            consume("]");
            break;
          } else {
            val += sgf[i];
            i++;
          }
        }
        node.properties[label].push(val);
        skipSpaces();
      }
    }
    return node;
  }

  function consume(expected: string) {
    skipSpaces();
    if (sgf[i] !== expected) {
      throw new Error(
        `Expected '${expected}' at position ${i}, found '${sgf[i]}'`,
      );
    }
    i++;
  }

  function skipSpaces() {
    while (/\s/.test(sgf[i])) i++;
  }
}

/* -------------- Utilities: parseBoardSize, fromSGFCoord, etc. ----------- */
function parseBoardSize(rootNode: SgfNode): number {
  const szProp = rootNode.properties["SZ"]?.[0];
  if (szProp) {
    const size = parseInt(szProp, 10);
    return isNaN(size) ? 19 : size;
  }
  return 19;
}

function fromSGFCoord(sgfCoord: string): [number, number] {
  // In SGF: first char => column, second char => row.
  // e.g. "aa" => row=0,col=0, "ab" => row=1,col=0, "ba" => row=0,col=1
  if (sgfCoord.length < 2) {
    // handle pass or invalid
    return [0, 0];
  }
  const col = sgfCoord.charCodeAt(0) - "a".charCodeAt(0);
  const row = sgfCoord.charCodeAt(1) - "a".charCodeAt(0);
  return [row, col];
}

function createEmptyBoard(size: number): BoardState {
  const board: BoardState = [];
  for (let i = 0; i < size; i++) {
    board.push(new Array(size).fill(0));
  }
  return board;
}
