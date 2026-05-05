import { describe, it, expect } from "vitest";
import { getBoardCutoff, makeCutoffSquare } from "./display";
import { SgfNode } from "./goGame";

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
