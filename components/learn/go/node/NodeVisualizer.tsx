"use client";

import { SgfNode } from "@/lib/go/goGame";
import { NodeBox } from "./NodeBox";
import {
  buildEdgePath,
  buildEdges,
  layoutNodes,
  NodePosition,
} from "./layoutNodes";
import { JSX, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface NodeVisualizerProps {
  rootNode: SgfNode;
  currentNode: SgfNode;
  onSelectNode: (node: SgfNode) => void;
  columnWidth?: number;
  rowHeight?: number;
  shapeSize?: number; // diameter for circles, or box size
}

/**
 * Ensures that:
 * 1) We recalc layout on every render, so new or changed moves appear.
 * 2) First child is horizontal, second child is diagonal, third+ children go vertical-then-diagonal.
 * 3) The "current node" is shown with a square highlight behind it.
 */
export function NodeVisualizer({
  rootNode,
  currentNode,
  onSelectNode,
  columnWidth = 80,
  rowHeight = 60,
  shapeSize = 30,
}: NodeVisualizerProps) {
  // This lifecycle method is for allowing left and right arrow key strokes
  // to navigate the go board
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        if (currentNode.parent) {
          onSelectNode(currentNode.parent);
        }
      } else if (event.key === "ArrowRight") {
        if (currentNode.children?.length) {
          onSelectNode(currentNode.children[0]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [onSelectNode, currentNode]);

  // 1) Layout
  const positions = new Map<SgfNode, NodePosition>();
  layoutNodes(rootNode, positions, { value: 0 });

  // 2) Edges
  const edges = buildEdges(rootNode);

  // 3) Container size
  let maxX = 0,
    maxY = 0;
  positions.forEach(({ x, y }) => {
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });
  const width = (maxX + 1) * columnWidth + shapeSize;
  const height = (maxY + 1) * rowHeight + shapeSize;

  // 4) Build lines
  function approximateRadius(n: SgfNode): number {
    // Root/edit => no radius, circle => (shapeSize - 6)/2
    if (!n.parent || !n.moveCoord) {
      return 0;
    }
    return (shapeSize - 6) / 2;
  }

  const pathElems = edges.map(([parent, child], i) => {
    const { x: pxIdx, y: pyIdx } = positions.get(parent)!;
    const { x: cxIdx, y: cyIdx } = positions.get(child)!;

    // Convert from grid coords to px (center)
    const px = pxIdx * columnWidth + columnWidth / 2;
    const py = pyIdx * rowHeight + rowHeight / 2;
    const cx = cxIdx * columnWidth + columnWidth / 2;
    const cy = cyIdx * rowHeight + rowHeight / 2;

    // Radii for offset
    const pR = approximateRadius(parent);
    const cR = approximateRadius(child);

    const d = buildEdgePath(px, py, pyIdx, cx, cy, cyIdx, pR, cR, rowHeight);
    return <path key={i} d={d} stroke="gray" strokeWidth={2} fill="none" />;
  });

  // 5) Position each node absolutely
  const nodeElems: JSX.Element[] = [];
  positions.forEach(({ x, y }, node) => {
    const left = x * columnWidth + (columnWidth - shapeSize) / 2;
    const top = y * rowHeight + (rowHeight - shapeSize) / 2;
    const isCurrent = node === currentNode;

    nodeElems.push(
      <div key={`${left}-${top}`} style={{ position: "absolute", left, top }}>
        <NodeBox
          node={node}
          isCurrent={isCurrent}
          size={shapeSize}
          onClick={() => onSelectNode(node)}
        />
      </div>,
    );
  });

  // Final render
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
      }}
    >
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
        }}
      >
        {pathElems}
      </svg>
      {nodeElems}
    </div>
  );
}
