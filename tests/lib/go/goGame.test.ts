import { describe, it, expect } from "vitest";
import {
  GoGame,
  coordToIndices,
  indicesToCoord,
  getNextColor,
} from "@/lib/go/goGame";
import { SuicideError, KoError, StoneExistsError } from "@/lib/go/error";

describe("lib/go/goGame", () => {
  describe("coordinate conversion", () => {
    it("converts coord to indices", () => {
      expect(coordToIndices("aa")).toEqual({ row: 0, col: 0 });
      expect(coordToIndices("pd")).toEqual({ row: 3, col: 15 });
    });

    it("converts indices to coord", () => {
      expect(indicesToCoord(0, 0)).toBe("aa");
      expect(indicesToCoord(3, 15)).toBe("pd");
      expect(indicesToCoord(-1, -1)).toBe("");
    });

    it("gets next color", () => {
      expect(getNextColor(1)).toBe(-1);
      expect(getNextColor(-1)).toBe(1);
      expect(getNextColor(0)).toBe(0);
    });
  });

  describe("GoGame class", () => {
    it("creates an empty game", () => {
      const game = GoGame.empty(19);
      expect(game.boardSize).toBe(19);
      expect(game.isEmpty()).toBe(true);
    });

    it("places stones and handles captures", () => {
      const game = GoGame.empty(19);
      let node = game.root;
      node = game.makeEdits(node, { addWhite: ["bb"] });
      node = game.playMove(node, 1, "ba");
      node = game.playMove(node, 1, "bc");
      node = game.playMove(node, 1, "ab");
      node = game.playMove(node, 1, "cb");

      const state = game.getBoardState(node);
      expect(state.stones["bb"]).toBeUndefined();
      expect(state.stones["cb"]).toBe(1);
    });

    it("detects suicide", () => {
      const game = GoGame.empty(19);
      let node = game.root;
      node = game.makeEdits(node, { addWhite: ["ab", "ba"] });
      expect(() => game.playMove(node, 1, "aa")).toThrow(SuicideError);
    });

    it("detects stone exists error", () => {
      const game = GoGame.empty(19);
      let node = game.root;
      node = game.makeEdits(node, { addBlack: ["aa"] });
      expect(() => game.playMove(node, -1, "aa")).toThrow(StoneExistsError);
    });

    it("detects Ko", () => {
      const game = GoGame.empty(19);
      let node = game.root;
      node = game.makeEdits(node, {
        addBlack: ["ba", "bc", "ab"],
        addWhite: ["ca", "cc", "db", "bb"],
      });

      node = game.playMove(node, 1, "cb", { koCheck: true });
      expect(() => game.playMove(node, -1, "bb", { koCheck: true })).toThrow(
        KoError,
      );
    });

    it("handles passing", () => {
      const game = GoGame.empty(19);
      const node = game.playPass(game.root, 1);
      expect(game.isPass(node)).toBe(true);
      expect(node.moveCoord).toBe("");
    });

    it("can swap colors in edit nodes", () => {
      const game = GoGame.empty(19);
      let node = game.makeEdits(game.root, {
        addBlack: ["aa"],
        addWhite: ["bb"],
      });
      game.swapColors(node);
      expect(node.addBlack).toEqual(["bb"]);
      expect(node.addWhite).toEqual(["aa"]);
    });

    it("can delete nodes", () => {
      const game = GoGame.empty(19);
      const node = game.playMove(game.root, 1, "aa");
      const parent = game.deleteNode(node);
      expect(parent.children).not.toContain(node);
    });

    it("throws error when deleting root or parentless node", () => {
      const game = GoGame.empty(19);
      expect(() => game.deleteNode(game.root)).toThrow(
        "Cannot delete root node",
      );
    });

    it("handles board resizing and cleans invalid nodes", () => {
      const game = GoGame.empty(19);
      const valid1 = game.playMove(game.root, 1, "aa");
      const invalid = game.playMove(valid1, -1, "ss");
      const valid2 = game.playMove(invalid, 1, "bb");

      game.setBoardSize(9);
      expect(game.boardSize).toBe(9);
      expect(valid1.children).not.toContain(invalid);
    });

    it("resets root if it has invalid coordinates after resize", () => {
      const game = GoGame.empty(19);
      game.editOnRoot({ addBlack: ["ss"] });
      game.setBoardSize(9);
      expect(game.isEmpty()).toBe(true);
    });

    it("throws for invalid board size", () => {
      const game = GoGame.empty(19);
      expect(() => game.setBoardSize(20)).toThrow("Invalid board size");
    });

    it("labels moves correctly with startNumber", () => {
      const game = GoGame.empty(19);
      let node = game.playMove(game.root, 1, "aa");
      node = game.playMove(node, -1, "bb");

      const state = game.getBoardState(node, 10);
      expect(state.labels["aa"]).toBe("10");
      expect(state.labels["bb"]).toBe("11");
    });

    it("resolves conflicting edits and reuses edit nodes", () => {
      const game = GoGame.empty(19);
      const node = game.makeEdits(game.root, {
        addBlack: ["aa"],
        addWhite: ["aa"],
      });
      expect(node.addWhite).toContain("aa");
      expect(node.addBlack).not.toContain("aa");

      const sameNode = game.makeEdits(node, { addBlack: ["bb"] });
      expect(sameNode).toBe(node);
      expect(node.addBlack).toContain("bb");

      const passNode = game.playPass(node, 1);
      const nodeWithAE = game.makeEdits(passNode, { removeStones: ["aa"] });
      expect(nodeWithAE.removeStones).toContain("aa");
      expect(nodeWithAE).not.toBe(node);
    });

    it("captures multiple groups at once", () => {
      const game = GoGame.empty(19);
      let node = game.makeEdits(game.root, { addWhite: ["bb", "dd"] });
      node = game.makeEdits(node, {
        addBlack: ["ba", "bc", "ab", "dc", "de", "cd"],
      });

      node = game.playMove(node, 1, "cb");
      node = game.playMove(node, 1, "ed");

      const state = game.getBoardState(node);
      expect(state.stones["bb"]).toBeUndefined();
      expect(state.stones["dd"]).toBeUndefined();
    });

    it("does not swap colors if node is not an edit node", () => {
      const game = GoGame.empty(19);
      const moveNode = game.playMove(game.root, 1, "aa");
      const sameNode = game.swapColors(moveNode);
      expect(sameNode).toBe(moveNode);
    });
  });
});
