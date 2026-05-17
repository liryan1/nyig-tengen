import { describe, it, expect } from "vitest";
import {
  getMoveNumber,
  getColNumber,
  layoutNodes,
  buildEdges,
  edgeToEdge,
  buildEdgePath,
  NodePosition,
} from "@/components/learn/go/node/layoutNodes";
import { SgfNode } from "@/lib/go/goGame";

describe("layoutNodes logic", () => {
  const root: SgfNode = { children: [], moveColor: 0 };
  const move1: SgfNode = {
    parent: root,
    children: [],
    moveCoord: "aa",
    moveColor: 1,
  };
  root.children.push(move1);
  const move2: SgfNode = {
    parent: move1,
    children: [],
    moveCoord: "bb",
    moveColor: -1,
  };
  move1.children.push(move2);
  const variation: SgfNode = {
    parent: move1,
    children: [],
    moveCoord: "cc",
    moveColor: -1,
  };
  move1.children.push(variation);

  describe("getMoveNumber", () => {
    it("counts move-placing ancestors", () => {
      expect(getMoveNumber(root)).toBe(0);
      expect(getMoveNumber(move1)).toBe(1);
      expect(getMoveNumber(move2)).toBe(2);
      expect(getMoveNumber(variation)).toBe(2);
    });
  });

  describe("getColNumber", () => {
    it("counts depth from root", () => {
      expect(getColNumber(root)).toBe(0);
      expect(getColNumber(move1)).toBe(1);
      expect(getColNumber(move2)).toBe(2);
    });
  });

  describe("layoutNodes", () => {
    it("assigns x and y positions correctly", () => {
      const positions = new Map<SgfNode, NodePosition>();
      layoutNodes(root, positions, { value: 0 });

      expect(positions.get(root)).toEqual({ x: 0, y: 0 });
      expect(positions.get(move1)).toEqual({ x: 1, y: 0 });
      expect(positions.get(move2)).toEqual({ x: 2, y: 0 });
      expect(positions.get(variation)).toEqual({ x: 2, y: 1 });
    });
  });

  describe("buildEdges", () => {
    it("lists all parent-child pairs", () => {
      const edges = buildEdges(root);
      expect(edges).toContainEqual([root, move1]);
      expect(edges).toContainEqual([move1, move2]);
      expect(edges).toContainEqual([move1, variation]);
      expect(edges.length).toBe(3);
    });
  });

  describe("edgeToEdge", () => {
    it("offsets points by radius", () => {
      const { sx, sy, tx, ty } = edgeToEdge(0, 0, 100, 0, 10, 10);
      expect(sx).toBe(10);
      expect(sy).toBe(0);
      expect(tx).toBe(90);
      expect(ty).toBe(0);
    });
  });

  describe("buildEdgePath", () => {
    it("returns horizontal line for same row", () => {
      const path = buildEdgePath(0, 0, 0, 100, 0, 0, 10, 10, 50);
      expect(path).toBe("M 10,0 L 90,0");
    });

    it("returns diagonal line for rowDist 1", () => {
      const path = buildEdgePath(0, 0, 0, 100, 50, 1, 10, 10, 50);
      // dist = sqrt(100^2 + 50^2) = sqrt(12500) approx 111.8
      expect(path).toContain("M");
      expect(path).toContain("L");
    });

    it("returns polyline for rowDist > 1", () => {
      const path = buildEdgePath(0, 0, 0, 100, 100, 2, 10, 10, 50);
      expect(path).toContain("M 0,10"); // start from bottom edge
      expect(path.split("L").length).toBe(3); // M -> L -> L
    });
  });
});
