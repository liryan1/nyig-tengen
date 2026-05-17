import { describe, it, expect } from "vitest";
import {
  fromSgf,
  toSgf,
  getBoardSize,
  getRootBoardState,
  getProblemInfoFromComments,
} from "@/lib/go/parser";

describe("lib/go/parser", () => {
  describe("getBoardSize", () => {
    it("extracts size from SZ property", () => {
      expect(getBoardSize("(;SZ[19])")).toBe(19);
      expect(getBoardSize("(;SZ[9])")).toBe(9);
    });

    it("defaults to 19", () => {
      expect(getBoardSize("(;)")).toBe(19);
    });
  });

  describe("fromSgf", () => {
    it("parses simple SGF", () => {
      const sgf = "(;B[pd]C[comment])";
      const root = fromSgf(sgf);
      expect(root.moveColor).toBe(1);
      expect(root.moveCoord).toBe("pd");
      expect(root.comment).toBe("comment");
    });

    it("parses setup properties", () => {
      const sgf = "(;AB[pd][dp]AW[pp]AE[dd])";
      const root = fromSgf(sgf);
      expect(root.addBlack).toEqual(["pd", "dp"]);
      expect(root.addWhite).toEqual(["pp"]);
      expect(root.removeStones).toEqual(["dd"]);
    });

    it("parses labels", () => {
      const sgf = "(;LB[aa:1][bb:A])";
      const root = fromSgf(sgf);
      expect(root.labels).toEqual({ aa: "1", bb: "A" });
    });

    it("parses variations", () => {
      const sgf = "(;B[pd](;W[dp])(;W[pp]))";
      const root = fromSgf(sgf);
      expect(root.children.length).toBe(2);
      expect(root.children[0].moveCoord).toBe("dp");
      expect(root.children[1].moveCoord).toBe("pp");
    });

    it("handles invalid SGF gracefully", () => {
      expect(fromSgf("invalid")).toEqual({ children: [] });
    });
  });

  describe("toSgf", () => {
    it("serializes node back to SGF", () => {
      const root = {
        moveColor: 1,
        moveCoord: "pd",
        comment: "test",
        children: [],
      } as any;
      const sgf = toSgf(root, 19);
      expect(sgf).toContain("B[pd]");
      expect(sgf).toContain("C[test]");
      expect(sgf).toContain("SZ[19]");
    });
  });

  describe("getRootBoardState", () => {
    it("calculates initial board state", () => {
      const sgf = "(;AB[pd]AW[dp])";
      const state = getRootBoardState(sgf);
      expect(state.stones["pd"]).toBe(1);
      expect(state.stones["dp"]).toBe(-1);
      expect(state.boardSize).toBe(19);
    });
  });

  describe("getProblemInfoFromComments", () => {
    it("parses key:value pairs from comments", () => {
      const comments = "rank: 5k\nauthor: admin";
      const info = getProblemInfoFromComments(comments);
      expect(info).toEqual({ rank: "5k", author: "admin" });
    });
  });
});
