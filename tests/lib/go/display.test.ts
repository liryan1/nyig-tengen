import { describe, it, expect } from "vitest";
import {
  getBoardCutoff,
  makeCutoffSquare,
  getRank,
  parseRank,
  getPixelSize,
} from "@/lib/go/display";
import { SgfNode } from "@/lib/go/goGame";

describe("getRank", () => {
  it("formats ranks correctly", () => {
    expect(getRank(-1)).toBe("1k");
    expect(getRank(0)).toBe("1d");
    expect(getRank(5)).toBe("6d");
    expect(getRank(-30)).toBe("30k");
  });

  it("handles decimal for average rank", () => {
    expect(getRank(0.5, true)).toBe("1.5d");
    expect(getRank(-1.5, true)).toBe("1.5k");
  });
});

describe("parseRank", () => {
  it("parses strings back to numbers", () => {
    expect(parseRank("1k")).toBe(-1);
    expect(parseRank("1d")).toBe(0);
    expect(parseRank("3k")).toBe(-3);
    expect(parseRank("2.5d")).toBe(1.5);
  });

  it("uses fallback for invalid strings", () => {
    expect(parseRank("invalid", -5)).toBe(-5);
  });
});

describe("getPixelSize", () => {
  it("calculates correct dimensions", () => {
    const { stoneSize, margin, boardPixelSize } = getPixelSize({
      cellSize: 20,
      boardSize: 19,
    });
    expect(stoneSize).toBeCloseTo(18.4);
    expect(margin).toBe(20);
    expect(boardPixelSize).toBe(18 * 20 + 20 * 2);
  });
});

describe("getBoardCutoff", () => {
  it("returns undefined when no stones found or showing whole board", () => {
    expect(getBoardCutoff([], 19)).toBeUndefined();
    expect(getBoardCutoff([{ children: [] }], 19)).toBeUndefined();
    // Whole board: stones at (0,0) and (18,18)
    expect(
      getBoardCutoff([{ addBlack: ["aa", "ss"], children: [] }], 19),
    ).toBeUndefined();
  });

  it("calculates padded bbox and applies anchoring", () => {
    // Center stone (10, 10), padding 3 -> [7, 13]
    const root: SgfNode = { moveCoord: "kk", children: [] };
    expect(getBoardCutoff([root], 19, 3)).toEqual({
      minX: 7,
      maxX: 13,
      minY: 7,
      maxY: 13,
    });

    // Corner stone (1, 1), anchored to 0 -> [0, 4]
    const corner: SgfNode = { addBlack: ["bb"], children: [] };
    expect(getBoardCutoff([corner], 19, 3)).toEqual({
      minX: 0,
      maxX: 4,
      minY: 0,
      maxY: 4,
    });
  });
});

describe("makeCutoffSquare", () => {
  it("converts rectangular cutoffs to squares with boundary awareness", () => {
    // Already square
    const sq = { minX: 5, maxX: 10, minY: 5, maxY: 10 };
    expect(makeCutoffSquare(sq, 19)).toEqual(sq);

    // Expand width to match height, centered
    expect(
      makeCutoffSquare({ minX: 4, maxX: 6, minY: 0, maxY: 10 }, 19),
    ).toEqual({
      minX: 0,
      maxX: 10,
      minY: 0,
      maxY: 10,
    });

    // Expand height and shift because of top edge
    const shifted = makeCutoffSquare(
      { minX: 5, maxX: 15, minY: 0, maxY: 1 },
      19,
    );
    expect(shifted.maxY - shifted.minY).toBe(10);
    expect(shifted.minY).toBe(0);
    expect(shifted.maxY).toBe(10);
  });
});
