// layoutNodes.ts
import { SgfNode } from "@/lib/go/goGame";

export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Count how many move-placing ancestors (node.moveCoord) are above.
 * Root/edit nodes do NOT increment.
 */
export function getMoveNumber(node: SgfNode): number {
  let count = 0;
  let current: SgfNode | undefined = node;
  while (current) {
    if (current.moveCoord !== undefined) {
      count++;
    }
    current = current.parent;
  }
  return count;
}

export function getColNumber(node: SgfNode): number {
  let count = 0;
  let current: SgfNode | undefined = node;
  while (current.parent) {
    count++;
    current = current.parent;
  }
  return count;
}

/**
 * Recursively assign (x, y) positions to each node so that:
 *  - x = moveNumber (all move #s line up in one vertical column)
 *  - The first child of a node shares the same row (y)
 *  - Subsequent siblings each get a new row below
 */
export function layoutNodes(
  node: SgfNode,
  positions: Map<SgfNode, NodePosition>,
  nextRowRef: { value: number }, // a mutable ref to track the next free row
  inheritedRow?: number,
): void {
  // 1) Assign col based on moveNumber
  const x = getColNumber(node);

  let y: number;
  if (typeof inheritedRow === "number") {
    // If we inherited a row from our parent, use that
    y = inheritedRow;
  } else {
    // Otherwise, use the next available row
    y = nextRowRef.value;
    nextRowRef.value++;
  }

  positions.set(node, { x, y });

  // 2) Now handle children
  if (!node.children || node.children.length === 0) return;

  // The first child inherits this row
  layoutNodes(node.children[0], positions, nextRowRef, y);

  // Additional siblings each get a fresh row
  for (let i = 1; i < node.children.length; i++) {
    layoutNodes(node.children[i], positions, nextRowRef, undefined);
  }
}

/** List all edges as [parent, child]. */
export function buildEdges(root: SgfNode): Array<[SgfNode, SgfNode]> {
  const edges: Array<[SgfNode, SgfNode]> = [];

  function dfs(node: SgfNode) {
    node.children.forEach((child) => {
      edges.push([node, child]);
      dfs(child);
    });
  }
  dfs(root);
  return edges;
}

/**
 * Calculate line endpoints from shape edge to shape edge
 * given the center of each node's shape and a radius.
 */
export function edgeToEdge(
  x1: number,
  y1: number, // parent's center
  x2: number,
  y2: number, // child's center
  r1: number,
  r2: number, // parent's radius, child's radius
) {
  // Direction vector
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 0.001) {
    // same point => just return the same coords
    return { sx: x1, sy: y1, tx: x2, ty: y2 };
  }

  // Move start point outward by r1
  const sx = x1 + (dx * r1) / dist;
  const sy = y1 + (dy * r1) / dist;

  // Move end point inward by r2
  const tx = x2 - (dx * r2) / dist;
  const ty = y2 - (dy * r2) / dist;

  return { sx, sy, tx, ty };
}

/**
 * Build an SVG path from the parent to the child, depending on how many rows apart they are.
 *
 * 1) If childRow == parentRow => horizontal line from parent's right edge to child's left edge.
 * 2) If childRow == parentRow + 1 => diagonal line from parent to child (edge offset).
 * 3) If childRow > parentRow + 1 =>
 *    - vertical line down from parent's bottom edge to (parentRow+1)
 *    - then diagonal/horizontal to child's center
 */
export function buildEdgePath(
  px: number, // parent's center x in px
  py: number, // parent's center y in px
  parentRow: number,
  cx: number, // child's center x in px
  cy: number, // child's center y in px
  childRow: number,
  pR: number, // parent's radius
  cR: number, // child's radius
  rowHeight: number,
): string {
  const rowDist = childRow - parentRow;

  if (rowDist === 0) {
    // 1) Horizontal => from parent's right edge to child's left edge
    const startX = px + pR;
    const endX = cx - cR;
    return `M ${startX},${py} L ${endX},${cy}`;
  } else if (rowDist === 1) {
    // 2) Diagonal => edgeToEdge
    const { sx, sy, tx, ty } = edgeToEdge(px, py, cx, cy, pR, cR);
    return `M ${sx},${sy} L ${tx},${ty}`;
  } else {
    // 3) rowDist > 1 =>
    // vertical line from parent's bottom edge => childRow's row-1 (center)
    // then from that point to child's center (offset by child's radius if you want)
    // We'll do a polyline: M -> L -> L
    const verticalTargetY = (childRow - 1) * rowHeight + rowHeight / 2; // center of (parentRow+1)
    // Start from parent's bottom edge
    const startX = px;
    const startY = py + pR;
    // Then line to (startX, verticalTargetY),
    // then line to child's center minus radius or child's center
    // For simplicity, let's do child's center:
    return `M ${startX},${startY} 
            L ${startX},${verticalTargetY} 
            L ${cx},${cy}`;
  }
}
