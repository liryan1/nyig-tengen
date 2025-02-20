import { BOARD_SIZES } from "./constants";
import { KoError, StoneExistsError, SuicideError } from "./error";
import { BoardState, StoneColor } from "./interface";
import { fromSgf, getBoardSize } from "./parser";

export interface SgfNode {
  // If this node is a move, it will have either 'B' or 'W'
  moveColor?: StoneColor; // 1 => Black, -1 => White
  moveCoord?: string; // coordinate like "dd" or "bd"

  // Edits: stones to add or remove
  addBlack?: string[]; // AB
  addWhite?: string[]; // AW
  removeStones?: string[]; // AE

  // Labels: LB[dd:1][ee:2] => labels["dd"] = "1", etc.
  labels?: Record<string, string>; // LB

  // Children in the variation tree
  children: SgfNode[];
  parent?: SgfNode;

  // Might store additional SGF properties on the node
  // e.g. comment, markers (CR, TR, SQ), etc., if needed
}

export interface EditProps {
  addBlack?: string[];
  addWhite?: string[];
  removeStones?: string[];
  labels?: Record<string, string>;
}

export interface PlayMoveOptions {
  // If true, detects immediate Ko repetition by checking board hash
  koCheck?: boolean;
}

export function coordToIndices(coord: string): { row: number; col: number } {
  // This is a simplistic approach assuming 'a' -> 0, 'b' -> 1, etc.
  // You may want to validate or adapt to your coordinate system.
  if (!coord || coord.length < 2) {
    throw new Error("Invalid coordinate: " + coord);
  }
  const colChar = coord[0];
  const rowChar = coord[1];
  const col = colChar.charCodeAt(0) - "a".charCodeAt(0);
  const row = rowChar.charCodeAt(0) - "a".charCodeAt(0);
  return { row, col };
}

// Convert row,col => 'dd'
export function indicesToCoord(row: number, col: number): string {
  if (row === -1 && col === -1) {
    return ""; // pass
  }
  return (
    String.fromCharCode("a".charCodeAt(0) + col) +
    String.fromCharCode("a".charCodeAt(0) + row)
  );
}

export function getNextColor(currentColor: StoneColor): StoneColor {
  if (currentColor === 0) {
    return 0;
  }
  return currentColor === -1 ? 1 : -1;
}

function getNeighbors(coord: string, size: number): string[] {
  const { row, col } = coordToIndices(coord);
  const neighbors: string[] = [];
  if (row > 0) neighbors.push(indicesToCoord(row - 1, col));
  if (row < size - 1) neighbors.push(indicesToCoord(row + 1, col));
  if (col > 0) neighbors.push(indicesToCoord(row, col - 1));
  if (col < size - 1) neighbors.push(indicesToCoord(row, col + 1));
  return neighbors;
}

export class GoGame {
  private readonly initialRoot: SgfNode = {
    addBlack: [],
    addWhite: [],
    removeStones: [],
    labels: {},
    children: [],
    moveColor: -1,
  };
  public root: SgfNode;
  public boardSize;

  /**
   * Create a GoLogic object with a root SGF node.
   * The root node might contain game info (size, rules, etc.),
   * plus optional AB/AW for initial setup.
   */
  constructor({
    boardSize = 19,
    root,
  }: {
    boardSize?: number;
    root?: SgfNode;
  }) {
    this.root = root ?? this.initialRoot;
    this.boardSize = boardSize;
  }

  /**
   * Builds and returns the board state from the root up to `targetNode`.
   * This method climbs from `targetNode` back to the root, collects nodes,
   * then applies them in forward order to produce the final board state.
   * if startNumber, number labels of moves from the root to the targetNode
   * are included in the board state
   */
  public getBoardState(targetNode: SgfNode, startNumber?: number): BoardState {
    // 1) Walk upward to the root
    const path: SgfNode[] = [];
    let node: SgfNode | undefined = targetNode;
    while (node) {
      path.push(node);
      node = node.parent;
    }
    path.reverse(); // Now it's from root -> targetNode

    // 2) Build an empty board
    const boardState: BoardState = {
      stones: {},
      labels: {},
    };

    // 3) Apply each node's content
    let moveNumber = startNumber;
    for (const n of path) {
      this.applyNodeChanges(boardState, n, moveNumber);
      if (moveNumber !== undefined && n.moveColor && n !== this.root) {
        moveNumber++;
      }
    }

    return boardState;
  }

  public setBoardSize(size: number) {
    if (!BOARD_SIZES.includes(size)) {
      throw new Error(`Invalid board size: ${size}`);
    }

    // Helper function to check if a coordinate is valid for the new size
    const isValidCoord = (coord: string): boolean => {
      try {
        const { row, col } = coordToIndices(coord);
        return row >= 0 && row < size && col >= 0 && col < size;
      } catch {
        return false;
      }
    };

    // Helper function to check if a node has any invalid coordinates
    const hasInvalidCoords = (node: SgfNode): boolean => {
      // Check move coordinate
      if (node.moveCoord && !isValidCoord(node.moveCoord)) {
        return true;
      }

      // Check addBlack coordinates
      if (
        node.addBlack &&
        node.addBlack.some((coord) => !isValidCoord(coord))
      ) {
        return true;
      }

      // Check addWhite coordinates
      if (
        node.addWhite &&
        node.addWhite.some((coord) => !isValidCoord(coord))
      ) {
        return true;
      }

      // Check removeStones coordinates
      if (
        node.removeStones &&
        node.removeStones.some((coord) => !isValidCoord(coord))
      ) {
        return true;
      }

      // Check labels
      if (
        node.labels &&
        Object.keys(node.labels).some((coord) => !isValidCoord(coord))
      ) {
        return true;
      }

      return false;
    };

    // Traverse the tree and remove invalid nodes
    const traverseAndClean = (node: SgfNode) => {
      // Filter children recursively
      node.children = node.children.filter((child) => {
        if (hasInvalidCoords(child)) {
          return false; // Remove this child and all its descendants
        }
        traverseAndClean(child); // Process valid child's descendants
        return true;
      });
    };

    // Check and clean root node
    if (hasInvalidCoords(this.root)) {
      // If root node has invalid coordinates, reset it
      this.root = this.initialRoot;
    } else {
      // Clean the rest of the tree
      traverseAndClean(this.root);
    }

    this.boardSize = size;
  }

  public isEmpty() {
    return !(
      this.root.addBlack?.length ||
      this.root.addWhite?.length ||
      this.root.children?.length ||
      Object.keys(this.root.labels ?? {}).length
    );
  }

  public swapColors(editNode: SgfNode): SgfNode {
    if (editNode.moveColor !== 0) {
      console.warn("Can only swap colors on edit nodes");
      return editNode;
    }

    // Swap addBlack and addWhite arrays
    const tempBlack = editNode.addBlack ? [...editNode.addBlack] : [];
    editNode.addBlack = editNode.addWhite ? [...editNode.addWhite] : [];
    editNode.addWhite = tempBlack;

    return editNode;
  }

  public static fromSgf(sgf: string) {
    const root = fromSgf(sgf);
    const boardSize = getBoardSize(sgf);
    return new GoGame({ root, boardSize });
  }

  /**
   * Add or remove stones and set labels according to the node.
   * If there's a move (B/W + moveCoord), place that stone and handle captures.
   */
  private applyNodeChanges(
    board: BoardState,
    node: SgfNode,
    moveNumber?: number,
  ) {
    // 1) Add black stones (AB)
    if (node.addBlack) {
      node.addBlack.forEach((coord) => {
        board.stones[coord] = 1; // black
      });
    }
    // 2) Add white stones (AW)
    if (node.addWhite) {
      node.addWhite.forEach((coord) => {
        board.stones[coord] = -1; // white
      });
    }
    // 3) Remove stones (AE)
    if (node.removeStones) {
      node.removeStones.forEach((coord) => {
        delete board.stones[coord];
      });
    }
    // 4) Apply labels (LB)
    if (node.labels) {
      // Overwrite or add labels
      for (const [coord, text] of Object.entries(node.labels)) {
        board.labels[coord] = text;
      }
    }
    // 5) If this node is a move (B or W), place that stone
    if ([-1, 1].includes(node.moveColor ?? 0) && node.moveCoord) {
      const { moveColor, moveCoord } = node;
      board.stones[moveCoord] = moveColor as StoneColor;

      // Check for captures
      this.removeCapturedStones(board, moveCoord);
      if (moveNumber !== undefined) {
        board.labels[moveCoord] = moveNumber.toString();
      }
    }
  }

  /**
   * Given a newly placed stone at `coord`, find any opposing groups with no liberties
   * as well as any suicides from the player’s own stone (in some rule sets you may allow “suicide”).
   */
  private removeCapturedStones(board: BoardState, placedCoord: string) {
    const color = board.stones[placedCoord];
    if (!color) return;

    const oppColor = (color === 1 ? -1 : 1) as StoneColor;

    // 1) Remove opponent groups that have zero liberties
    const neighbors = getNeighbors(placedCoord, this.boardSize);
    const oppGroupsCoords: Set<string> = new Set();

    neighbors.forEach((nCoord) => {
      if (board.stones[nCoord] === oppColor) {
        oppGroupsCoords.add(nCoord);
      }
    });

    // For each distinct group among those neighbors, check if it has liberties
    const visitedOpp = new Set<string>();
    for (const c of oppGroupsCoords) {
      if (visitedOpp.has(c)) continue;
      const group = this.floodFillGroup(c, board, oppColor);
      group.forEach((x) => visitedOpp.add(x));
      if (!this.hasGroupLiberties(group, board)) {
        // Capture all in that group
        group.forEach((gCoord) => {
          delete board.stones[gCoord];
        });
      }
    }

    // 2) Check if the newly placed stone itself is in a group with no liberties
    const myGroup = this.floodFillGroup(placedCoord, board, color);
    if (!this.hasGroupLiberties(myGroup, board)) {
      throw new SuicideError("Illegal move: suicide is not allowed");
    }
  }

  /**
   * Returns all connected stones (same color) from the startCoord
   */
  private floodFillGroup(
    startCoord: string,
    board: BoardState,
    color: StoneColor,
  ): Set<string> {
    const stack = [startCoord];
    const result = new Set<string>();
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (result.has(current)) continue;
      result.add(current);
      // push neighbors of same color
      const neighbors = getNeighbors(current, this.boardSize);
      for (const n of neighbors) {
        if (board.stones[n] === color && !result.has(n)) {
          stack.push(n);
        }
      }
    }
    return result;
  }

  /**
   * Check if any stone in a group touches an empty space => group has liberties
   */
  private hasGroupLiberties(group: Set<string>, board: BoardState): boolean {
    for (const coord of group) {
      const neighbors = getNeighbors(coord, this.boardSize);
      for (const n of neighbors) {
        if (!board.stones[n]) {
          return true;
        }
      }
    }
    return false;
  }

  public deleteNode(node: SgfNode) {
    if (this.root === node || !node.parent) {
      throw new Error("Cannot delete root node or node without any parents");
    }

    // Remove the node from its parent's children array
    node.parent.children = node.parent.children.filter(
      (child) => child !== node,
    );
    return node.parent;
  }

  /**
   * Insert a child node for a move (black or white) at `coord`.
   * Returns the newly created node to continue adding variations.
   *
   * A minimal Ko check is provided (by hashing the board before and after).
   * Ko check is enabled via `playMoveOptions.koCheck`.
   */
  public playMove(
    parentNode: SgfNode,
    color: StoneColor,
    coord: string,
    playMoveOptions: PlayMoveOptions = {},
  ): SgfNode {
    // Reconstruct board up to parent
    const boardBefore = this.getBoardState(parentNode);

    if (boardBefore.stones[coord]) {
      throw new StoneExistsError(
        "Illegal move: stone already exists at " + coord,
      );
    }

    // If Ko check is needed, store a hash of the board
    const boardHashBefore =
      playMoveOptions.koCheck && parentNode.parent
        ? this.boardHash(this.getBoardState(parentNode.parent))
        : "";

    for (const n of parentNode.children) {
      if (n.moveColor === color && n.moveCoord === coord) {
        return n; // This move already exists
      }
    }

    // Create a new node
    const newNode: SgfNode = {
      moveColor: color,
      moveCoord: coord,
      children: [],
      parent: parentNode,
    };

    // Rebuild board after placing stone and removing captures
    // (We do so by retrieving the final state from newNode itself.)
    const boardAfter = this.getBoardState(newNode);
    const boardHashAfter = playMoveOptions.koCheck
      ? this.boardHash(boardAfter)
      : "";

    // Check Ko (very simplified approach)
    if (playMoveOptions.koCheck && boardHashBefore === boardHashAfter) {
      // Then it’s effectively a repetition of the board (ko).
      // Typically you disallow it in standard Ko rules.
      // You can decide how to handle this situation.
      // For demonstration, just throw an Error:
      throw new KoError("Illegal move: cannot immediately capture Ko");
    }

    // Attach to parent's children
    parentNode.children.push(newNode);

    return newNode;
  }

  public playPass(parentNode: SgfNode, color: StoneColor): SgfNode {
    const moveCoord = ""; // empty string represents pass in SGF
    for (const n of parentNode.children) {
      if (n.moveColor === color && n.moveCoord === moveCoord) {
        return n; // This move already exists
      }
    }
    const newNode: SgfNode = {
      moveColor: color,
      moveCoord,
      children: [],
      parent: parentNode,
    };
    parentNode.children.push(newNode);
    return newNode;
  }

  public isPass(node: SgfNode): boolean {
    return node.moveColor !== undefined && node.moveCoord === "";
  }

  /**
   * Make edits (AE, AB, AW, LB) on the board at `parentNode`.
   * Contains regular SGF logic:
   * If current node is edit and has no children, edit on the same node
   * Otherwise, creates a new node if necessary.
   * This returns a new node containing the edits.
   */
  public makeEdits(parentNode: SgfNode, editProps: EditProps): SgfNode {
    let editNode: SgfNode;
    if (parentNode.moveColor === 0 && !parentNode.children?.length) {
      // If we're on an edit node and there are no children, edit on the same node
      editNode = parentNode;
    } else {
      // Otherwise create a new node
      editNode = {
        children: [],
        parent: parentNode,
        moveColor: 0, // 0 means it's not a move
      };
      parentNode.children.push(editNode);
    }

    return this.performEdit(editNode, editProps);
  }

  public editOnRoot(editProps: EditProps) {
    return this.performEdit(this.root, editProps);
  }

  private performEdit(
    editNode: SgfNode,
    { addBlack, addWhite, removeStones, labels }: EditProps,
  ) {
    if (addBlack) {
      editNode.addBlack = [...addBlack, ...(editNode.addBlack ?? [])];
      editNode.addWhite =
        editNode.addWhite?.filter((coord) => !addBlack.includes(coord)) ?? [];
    }

    if (addWhite) {
      editNode.addWhite = [...addWhite, ...(editNode.addWhite ?? [])];
      editNode.addBlack =
        editNode.addBlack?.filter((coord) => !addWhite.includes(coord)) ?? [];
    }

    if (removeStones) {
      editNode.removeStones = removeStones.filter(
        (coord) =>
          !editNode.addBlack?.includes(coord) &&
          !editNode.addWhite?.includes(coord),
      );
      editNode.addBlack =
        editNode.addBlack?.filter((coord) => !removeStones.includes(coord)) ??
        [];
      editNode.addWhite =
        editNode.addWhite?.filter((coord) => !removeStones.includes(coord)) ??
        [];
    }

    if (labels) editNode.labels = { ...labels, ...editNode.labels };

    return editNode;
  }

  /**
   * Very basic board hasher (for Ko checks or repetition checks).
   */
  private boardHash(board: BoardState): string {
    const coords = Object.keys(board.stones).sort();
    const stoneString = coords
      .map((c) => {
        return c + ":" + board.stones[c];
      })
      .join("|");
    return stoneString;
  }
}
