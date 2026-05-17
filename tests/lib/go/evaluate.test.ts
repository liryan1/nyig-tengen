import { describe, it, expect } from "vitest";
import { getMoves, getEvaluation, evaluate } from "@/lib/go/evaluate";
import { SgfNode } from "@/lib/go/goGame";

describe("lib/go/evaluate", () => {
  const nodeA: SgfNode = { moveCoord: "aa", children: [] };
  const nodeB: SgfNode = { moveCoord: "bb", parent: nodeA, children: [] };
  nodeA.children.push(nodeB);
  const nodeC: SgfNode = { moveCoord: "cc", parent: nodeB, children: [] };
  nodeB.children.push(nodeC);

  describe("getMoves", () => {
    it("returns correct move sequence from node", () => {
      expect(getMoves(nodeC)).toEqual(["aa", "bb", "cc"]);
      expect(getMoves(nodeA)).toEqual(["aa"]);
    });
  });

  describe("getEvaluation", () => {
    const solutionTree: SgfNode = {
      children: [
        {
          moveCoord: "pd",
          children: [
            {
              moveCoord: "dp",
              children: [{ moveCoord: "pp", children: [] }],
            },
          ],
        },
      ],
    };

    it("returns solved when all moves match and it is a leaf node", () => {
      expect(getEvaluation(["pd", "dp", "pp"], solutionTree)).toEqual({
        status: "solved",
        mismatchIndex: 3,
      });
    });

    it("returns partial when moves match but more are needed", () => {
      expect(getEvaluation(["pd"], solutionTree)).toEqual({
        status: "partial",
        mismatchIndex: 1,
      });
    });

    it("returns mismatch when user move is wrong", () => {
      expect(getEvaluation(["pd", "xx"], solutionTree)).toEqual({
        status: "mismatch",
        mismatchIndex: 1,
        correctOpponentMove: "dp",
      });

      expect(getEvaluation(["zz"], solutionTree)).toEqual({
        status: "mismatch",
        mismatchIndex: 0,
      });
    });
  });

  describe("evaluate", () => {
    const solutionTree: SgfNode = {
      children: [{ moveCoord: "aa", children: [] }],
    };

    it("increments correctCount on solved", () => {
      const result = evaluate(["aa"], solutionTree);
      expect(result.evaluation.status).toBe("solved");
      expect(result.stats.correctCount?.increment).toBe(1);
      expect(result.stats.submissionCount?.increment).toBe(1);
    });

    it("does not increment correctCount on partial", () => {
      const complexTree: SgfNode = {
        children: [
          { moveCoord: "aa", children: [{ moveCoord: "bb", children: [] }] },
        ],
      };
      const result = evaluate(["aa"], complexTree);
      expect(result.evaluation.status).toBe("partial");
      expect(result.stats.correctCount).toBeUndefined();
      expect(result.stats.submissionCount).toBeUndefined();
    });

    it("increments submissionCount on mismatch", () => {
      const result = evaluate(["bb"], solutionTree);
      expect(result.evaluation.status).toBe("mismatch");
      expect(result.stats.correctCount).toBeUndefined();
      expect(result.stats.submissionCount?.increment).toBe(1);
    });
  });
});
