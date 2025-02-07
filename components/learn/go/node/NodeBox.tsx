import { SgfNode } from "@/lib/go/goGame";
import { getMoveNumber } from "./layoutNodes";
import { TriangleIcon } from "lucide-react";

export function NodeBox({
  node,
  isCurrent,
  size,
  onClick,
}: {
  node: SgfNode;
  isCurrent: boolean;
  size: number;
  onClick: () => void;
}) {
  // Root => blank
  const isRoot = !node.parent;
  // Edit => '^'
  const isEdit = !node.moveCoord && !isRoot;
  // Move => circle with move#
  const isMove = !!node.moveCoord;

  // We'll do a square container. If isCurrent => background color
  const boxStyle: React.CSSProperties = {
    width: size,
    height: size,
    background: isCurrent ? "rgba(255, 165, 0, 0.3)" : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  if (isRoot) {
    return (
      <div style={boxStyle} onClick={onClick}>
        <TriangleIcon />
      </div>
    );
  }
  if (isEdit) {
    return (
      <div style={boxStyle} onClick={onClick}>
        <TriangleIcon />
      </div>
    );
  }
  if (isMove) {
    const moveNum = getMoveNumber(node);
    const isBlack = node.moveColor === 1;
    const circleStyle: React.CSSProperties = {
      width: size - 6,
      height: size - 6,
      borderRadius: "50%",
      border: "2px solid black",
      background: isBlack ? "black" : "white",
      color: isBlack ? "white" : "black",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "14px",
    };
    return (
      <div style={boxStyle} onClick={onClick}>
        <div style={circleStyle}>{moveNum}</div>
      </div>
    );
  }
  return null;
}
