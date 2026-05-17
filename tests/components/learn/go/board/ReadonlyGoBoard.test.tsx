import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReadonlyGoBoard } from "@/components/learn/go/board/ReadonlyGoBoard";

describe("ReadonlyGoBoard", () => {
  it("renders a board from SGF", () => {
    const sgf = "(;SZ[9]AB[aa][bb])";
    const { container } = render(<ReadonlyGoBoard sgf={sgf} cellSize={40} />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    // Should have 2 stones
    const stones = container.querySelectorAll("circle[stroke-width='1.5px']");
    expect(stones.length).toBe(2);
  });

  it("calculates automatic cutoff from SGF stones", () => {
    const sgf = "(;SZ[19]AB[aa][ab])"; // stones in corner
    const { container } = render(<ReadonlyGoBoard sgf={sgf} cellSize={40} />);

    const svg = container.querySelector("svg");
    // With 2 stones at (0,0) and (0,1), cutoff should be much smaller than full board
    const width = parseInt(svg?.getAttribute("width") || "0");
    expect(width).toBeLessThan(800); // 19x19 is 800
  });
});
