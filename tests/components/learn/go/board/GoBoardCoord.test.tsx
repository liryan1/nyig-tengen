import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GoBoardCoord } from "@/components/learn/go/board/GoBoardCoord";

describe("GoBoardCoord", () => {
  it("renders column labels (A, B, C...) and row labels (1, 2, 3...)", () => {
    render(<GoBoardCoord boardSize={19} cellSize={40} />);

    expect(screen.getAllByText("A").length).toBe(2);
    // Row 19 is the top row (row index 0)
    expect(screen.getAllByText("19").length).toBe(2);
    // Row 1 is the bottom row (row index 18)
    expect(screen.getAllByText("1").length).toBe(2);
  });

  it("skips 'I' in column labels", () => {
    render(<GoBoardCoord boardSize={19} cellSize={40} />);

    // Index 7 is H
    expect(screen.getAllByText("H").length).toBe(2);
    // Index 8 is J
    expect(screen.getAllByText("J").length).toBe(2);
    // There should be no I
    expect(screen.queryByText("I")).not.toBeInTheDocument();
  });

  it("handles cutoff region correctly", () => {
    const cutoff = { minX: 0, maxX: 0, minY: 0, maxY: 0 }; // Only A19
    render(<GoBoardCoord boardSize={19} cellSize={40} cutoff={cutoff} />);

    expect(screen.getAllByText("A").length).toBe(2);
    expect(screen.getAllByText("19").length).toBe(2);
    expect(screen.queryByText("B")).not.toBeInTheDocument();
    expect(screen.queryByText("18")).not.toBeInTheDocument();
  });
});
