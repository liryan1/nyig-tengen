import { describe, it, expect } from "vitest";
import {
  validateProblemInitial,
  validateBoardSize,
  validateProblemSolutions,
} from "@/lib/go/validator";

describe("lib/go/validator", () => {
  describe("validateBoardSize", () => {
    it("throws for invalid board sizes", () => {
      expect(() => validateBoardSize("(;SZ[2])")).toThrow();
      expect(() => validateBoardSize("(;SZ[20])")).toThrow();
    });

    it("passes for valid board sizes", () => {
      expect(() => validateBoardSize("(;SZ[19])")).not.toThrow();
      expect(() => validateBoardSize("(;SZ[9])")).not.toThrow();
    });
  });

  describe("validateProblemInitial", () => {
    it("throws if variations exist", () => {
      expect(() => validateProblemInitial("(;AB[pd](;W[dp]))")).toThrow();
    });

    it("passes for valid initial setup", () => {
      expect(() => validateProblemInitial("(;AB[pd]AW[dp])")).not.toThrow();
    });
  });

  describe("validateProblemSolutions", () => {
    it("throws if no children", () => {
      expect(() => validateProblemSolutions("(;AB[pd])")).toThrow();
    });

    it("passes if variations exist", () => {
      expect(() => validateProblemSolutions("(;AB[pd](;W[dp]))")).not.toThrow();
    });
  });
});
