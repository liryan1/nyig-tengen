// -------------------------------------------------------------------------
// A small SGF parser and serializer for the SgfNode structure.
// -------------------------------------------------------------------------

import { GoGame, SgfNode } from "./goGame";
import { BoardState, StoneColor } from "./interface";

/**
 * Extend the SgfNode interface to store unrecognized SGF props in `extras`.
 * You can merge this into your existing SgfNode definition if you like.
 */
export interface ExtendedSgfNode extends SgfNode {
  comment?: string; // We parse 'C' property into here
  extras?: Record<string, string[]>; // Catch-all for unrecognized properties
}

export function getBoardSize(sgf?: string) {
  return Number.parseInt(sgf?.match(/SZ\[(\d+)\]/)?.[1] ?? "19");
}

/**
 * Parse the first SGF GameTree from the given string.
 * Returns the root SgfNode of that tree.
 */
export function fromSgf(sgf: string): SgfNode {
  const parser = new SgfParser(sgf);
  const gameTrees = parser.parseCollection();

  if (gameTrees.length === 0) {
    // No valid game trees found
    throw new Error("No valid SGF GameTree found in input.");
  }

  // Return the first game tree's root node
  return gameTrees[0];
}

/**
 * Serialize the given root node (and its entire variation subtree)
 * back into SGF format.
 */
export function toSgf(root: SgfNode, boardSize: number): string {
  // Build a single SGF "GameTree" string from this root
  return `(;SZ[${boardSize}]` + buildGameTreeString(root) + ")";
}

export function getRootBoardState(sgf: string): BoardState {
  const root = fromSgf(sgf);
  const boardSize = getBoardSize(sgf);
  const game = new GoGame({ boardSize, root });
  return game.getBoardState(root);
}

// -------------------------------------------------------------------------
// Internals: Parsing
// -------------------------------------------------------------------------

class SgfParser {
  private i = 0; // current index in sgf
  private tokens: string; // the SGF string

  constructor(sgf: string) {
    // Normalize newlines to simplify property-value reading
    // (SGF usually allows multiline property values.)
    this.tokens = sgf.replace(/\r\n/g, "\n");
    this.i = 0;
  }

  public parseCollection(): ExtendedSgfNode[] {
    // A Collection is one or more GameTrees in sequence.
    // We'll parse until we can’t parse more.
    const results: ExtendedSgfNode[] = [];
    this.skipWhitespace();

    while (this.peek() === "(") {
      const tree = this.parseGameTree();
      if (tree) {
        results.push(tree);
      }
      this.skipWhitespace();
    }
    return results;
  }

  private parseGameTree(): ExtendedSgfNode | null {
    // GameTree := "(" Sequence GameTree* ")"
    if (this.peek() !== "(") return null;
    this.next(); // consume '('

    // Parse the linear Sequence (one or more Nodes)
    const seq = this.parseSequence();
    if (seq.length === 0) {
      // Must have at least one Node in a Sequence
      throw new Error("Invalid SGF: empty sequence inside parentheses.");
    }

    // The first node in the sequence is the "root" for this block
    const root = seq[0];

    // The sequence is a linear chain: seq[0] -> seq[1] -> ...
    for (let i = 0; i < seq.length - 1; i++) {
      const parent = seq[i];
      const child = seq[i + 1];
      child.parent = parent;
      parent.children.push(child);
    }

    // Now parse zero or more subtrees (each is a GameTree),
    // which should be attached as children of the *last* node in the sequence.
    const lastNode = seq[seq.length - 1];
    this.skipWhitespace();

    while (this.peek() === "(") {
      const subtree = this.parseGameTree();
      if (subtree) {
        // The returned 'subtree' is actually a chain of nodes,
        // i.e. subtree is the root of that variation.
        subtree.parent = lastNode;
        lastNode.children.push(subtree);
      }
      this.skipWhitespace();
    }

    if (this.peek() !== ")") {
      throw new Error("Invalid SGF: missing closing parenthesis.");
    }
    this.next(); // consume ')'

    return root;
  }

  private parseSequence(): ExtendedSgfNode[] {
    // Sequence := Node+
    // That is, one or more Nodes, each starting with ';'
    const nodes: ExtendedSgfNode[] = [];
    this.skipWhitespace();

    while (this.peek() === ";") {
      const node = this.parseNode();
      nodes.push(node);
      this.skipWhitespace();
    }
    return nodes;
  }

  private parseNode(): ExtendedSgfNode {
    // Node := ";" Property*
    // We already know the first character is ';'
    this.next(); // consume ';'
    this.skipWhitespace();

    const node: ExtendedSgfNode = {
      moveColor: 0,
      children: [],
      labels: {},
      extras: {},
    };

    // Now read zero or more properties
    while (true) {
      this.skipWhitespace();
      const propIdent = this.readPropIdent();
      if (!propIdent) {
        // No more properties here
        break;
      }

      // Each property can have multiple values e.g. AB[xx][yy]
      const propValues: string[] = [];
      while (true) {
        this.skipWhitespace();
        if (this.peek() !== "[") {
          break;
        }
        const val = this.readPropValue();
        propValues.push(val);
      }

      // Process the property name + values into the node
      this.handleProperty(node, propIdent, propValues);
    }

    return node;
  }

  private handleProperty(
    node: ExtendedSgfNode,
    ident: string,
    values: string[],
  ) {
    switch (ident) {
      case "B": {
        // Black move. Usually only one value with the coordinate or empty for pass
        node.moveColor = 1 as StoneColor;
        node.moveCoord = values[0] || undefined;
        break;
      }
      case "W": {
        // White move
        node.moveColor = -1 as StoneColor;
        node.moveCoord = values[0] || undefined;
        break;
      }
      case "AB": {
        // Add black stones
        if (!node.addBlack) node.addBlack = [];
        node.addBlack.push(...values);
        break;
      }
      case "AW": {
        // Add white stones
        if (!node.addWhite) node.addWhite = [];
        node.addWhite.push(...values);
        break;
      }
      case "AE": {
        // Remove stones
        if (!node.removeStones) node.removeStones = [];
        node.removeStones.push(...values);
        break;
      }
      case "LB": {
        // Labels can be multiple, e.g. LB[dd:1][ee:2]
        for (const v of values) {
          // v might look like "dd:1"
          const idx = v.indexOf(":");
          if (idx > 0) {
            const coord = v.slice(0, idx);
            const label = v.slice(idx + 1);
            node.labels![coord] = label;
          }
        }
        break;
      }
      case "C": {
        // Comment - often multiline. We'll store it in node.comment
        // (If multiple C props appear, let's just join them with \n)
        const combined = values.join("\n");
        node.comment = node.comment ? node.comment + "\n" + combined : combined;
        break;
      }
      default: {
        // Unrecognized: store in node.extras
        if (!node.extras) node.extras = {};
        if (!node.extras[ident]) {
          node.extras[ident] = [];
        }
        node.extras[ident].push(...values);
        break;
      }
    }
  }

  // Read a property identifier: 1+ uppercase letters: [A-Z]+
  private readPropIdent(): string {
    this.skipWhitespace();
    let ident = "";
    while (/^[A-Z]$/.test(this.peek())) {
      ident += this.peek();
      this.next();
    }
    return ident;
  }

  // Reads a bracketed value: "[...]" ignoring "[]" inside?
  // For a naive parser, we just read until the matching "]".
  private readPropValue(): string {
    if (this.peek() !== "[") {
      throw new Error("Expected '[' at position " + this.i);
    }
    this.next(); // consume '['
    const start = this.i;
    let value = "";
    while (true) {
      if (this.isEOF()) {
        throw new Error("Unclosed '[' in property value.");
      }
      if (this.peek() === "]") {
        // end of property value
        const end = this.i;
        // read the substring
        value = this.tokens.slice(start, end);
        this.next(); // consume ']'
        break;
      }
      this.next();
    }
    // Usually we'd unescape backslashes here, but let's skip for brevity
    // Trim or keep it as-is? We'll keep as-is except for removing newlines if needed.
    return value.replace(/\s+$/, ""); // remove trailing newlines/spaces
  }

  private skipWhitespace() {
    while (/\s/.test(this.peek())) {
      this.next();
    }
  }

  private peek(): string {
    if (this.i >= this.tokens.length) return "";
    return this.tokens[this.i];
  }

  private next() {
    this.i++;
  }

  private isEOF(): boolean {
    return this.i >= this.tokens.length;
  }
}

// -------------------------------------------------------------------------
// Internals: Serialization
// -------------------------------------------------------------------------

/**
 * Build an SGF string for a single GameTree: "(" Sequence GameTree* ")"
 * We'll treat the root + its linear chain of single children as the Sequence,
 * then each child beyond the main line is a separate GameTree.
 */
function buildGameTreeString(root: SgfNode): string {
  return "(" + buildSequenceAndSubTrees(root) + ")";
}

/**
 * We gather a linear chain of nodes (the "main line") from `startNode`
 * by following the first child if there is exactly one child.
 * Once we reach a node that has 0 or >=2 children, we stop the chain.
 * Then for each child of that last node, we build a subtree.
 */
function buildSequenceAndSubTrees(node: SgfNode): string {
  // 1) Gather the main line of nodes
  const sequence: SgfNode[] = [];
  let current: SgfNode | undefined = node;
  while (current) {
    sequence.push(current);
    if (current.children.length === 1) {
      // Continue down the single-child chain
      current = current.children[0];
    } else {
      // either 0 children or multiple children => stop
      break;
    }
  }

  // 2) Build the sequence portion: ;Prop Prop ...
  let result = sequence.map((n) => serializeNode(n)).join("");

  // 3) Now, if the last node in the chain has children beyond the first (if multiple),
  // we produce subtrees for each child.
  const last = sequence[sequence.length - 1];
  if (last?.children?.length > 1) {
    // Each additional child is a variation => separate ( ... ) block
    for (let i = 0; i < last.children.length; i++) {
      const child = last.children[i];
      // The "main line" used up the first child (index 0). So subtrees start from i=0 or i=1?
      // Typically if there's 2 children, you pick the "first" as part of the sequence, but
      // we've included it in the chain. So let's do a check:
      if (i === 0 && last.children.length > 1) {
        // The first child was included in the chain if chain ends exactly at last, but
        // if there's multiple children, we can't also continue it in the main line.
        // We'll handle them all as subtrees for simplicity.
      }
      result += buildGameTreeString(child);
    }
  } else if (last?.children?.length === 1) {
    // If there's exactly 1 child left but we ended because that node had 1 child,
    // we already included it in the chain. So there's no separate subtrees to add.
  }

  return result;
}

/**
 * Build the semicolon + properties for a single Node.
 * e.g.: `;B[dd]C[a comment]LB[da:1][db:2]`
 */
function serializeNode(node: SgfNode): string {
  const parts: string[] = [];

  // B or W move
  if (node.moveColor === 1 && node.moveCoord !== undefined) {
    parts.push(`B[${node.moveCoord}]`);
  } else if (node.moveColor === -1 && node.moveCoord !== undefined) {
    parts.push(`W[${node.moveCoord}]`);
  }

  // AB, AW, AE arrays
  if (node.addBlack && node.addBlack.length > 0) {
    const val = node.addBlack.map((v) => `[${v}]`).join("");
    parts.push(`AB${val}`);
  }
  if (node.addWhite && node.addWhite.length > 0) {
    const val = node.addWhite.map((v) => `[${v}]`).join("");
    parts.push(`AW${val}`);
  }
  if (node.removeStones && node.removeStones.length > 0) {
    const val = node.removeStones.map((v) => `[${v}]`).join("");
    parts.push(`AE${val}`);
  }

  // Labels LB[dd:1][ee:2]
  const labelEntries = node.labels ? Object.entries(node.labels) : [];
  if (labelEntries.length > 0) {
    const val = labelEntries
      .map(([coord, text]) => `[${coord}:${text}]`)
      .join("");
    parts.push(`LB${val}`);
  }

  // Comment 'C'
  const nodeExt = node as ExtendedSgfNode;
  if (nodeExt.comment) {
    // If we wanted to handle escaping ']', we would do that here. We'll do naive:
    const escaped = nodeExt.comment.replace(/\]/g, "\\]");
    parts.push(`C[${escaped}]`);
  }

  // Extras
  if (nodeExt.extras) {
    for (const [propName, propValues] of Object.entries(nodeExt.extras)) {
      // Each property can have multiple values => e.g. XX[one][two]
      const val = propValues.map((v) => `[${v}]`).join("");
      parts.push(`${propName}${val}`);
    }
  }

  if (parts.length === 0) {
    // If there are truly no properties, we still need the semicolon
    return ";";
  }

  return ";" + parts.join("");
}
