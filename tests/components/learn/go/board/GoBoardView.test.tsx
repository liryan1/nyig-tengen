import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GoBoardView } from "@/components/learn/go/board/GoBoardView";
import { BoardState } from "@/lib/go/interface";

describe("GoBoardView", () => {
  const defaultBoardState: BoardState = {
    stones: {},
    labels: {},
    boardSize: 19,
  };

  it("renders an SVG board with correct dimensions", () => {
    const { container } = render(
      <GoBoardView
        boardState={defaultBoardState}
        cellSize={40}
        boardSize={19}
      />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    // boardPixelSize = (19-1)*40 + 40*2 = 720 + 80 = 800
    expect(svg).toHaveAttribute("width", "800");
    expect(svg).toHaveAttribute("height", "800");
  });

  it("renders correct number of grid lines for 19x19", () => {
    const { container } = render(
      <GoBoardView boardState={defaultBoardState} boardSize={19} />,
    );
    const lines = container.querySelectorAll("line");
    // 19 horizontal + 19 vertical = 38 lines
    expect(lines.length).toBe(38);
  });

  it("renders correct number of grid lines for 9x9", () => {
    const { container } = render(
      <GoBoardView boardState={defaultBoardState} boardSize={9} />,
    );
    const lines = container.querySelectorAll("line");
    // 9 horizontal + 9 vertical = 18 lines
    expect(lines.length).toBe(18);
  });

  it("renders stones at correct positions", () => {
    const boardState: BoardState = {
      stones: {
        aa: 1, // Black at (0,0)
        pd: -1, // White at (15,3)
      },
      labels: {},
      boardSize: 19,
    };
    const { container } = render(
      <GoBoardView boardState={boardState} cellSize={40} boardSize={19} />,
    );

    const stones = container.querySelectorAll("circle[stroke-width='1.5px']");
    expect(stones.length).toBe(2);

    // "aa" is (0,0) -> cx = margin + 0*40 = 40, cy = 40
    // "pd" is (15,3) -> cx = margin + 15*40 = 40 + 600 = 640, cy = 40 + 3*40 = 160

    const stonePositions = Array.from(stones).map((s) => ({
      cx: s.getAttribute("cx"),
      cy: s.getAttribute("cy"),
      fill: s.getAttribute("fill"),
    }));

    expect(stonePositions).toContainEqual({
      cx: "40",
      cy: "40",
      fill: "black",
    });
    expect(stonePositions).toContainEqual({
      cx: "640",
      cy: "160",
      fill: "white",
    });
  });

  it("renders labels correctly", () => {
    const boardState: BoardState = {
      stones: { aa: 1 },
      labels: { aa: "1", bb: "A" },
      boardSize: 19,
    };
    render(<GoBoardView boardState={boardState} />);

    const label1 = screen.getByText("1");
    const labelA = screen.getByText("A");

    expect(label1).toBeInTheDocument();
    expect(labelA).toBeInTheDocument();

    // Label on black stone should be white
    expect(label1).toHaveAttribute("fill", "white");
    // Label on empty intersection should be black
    expect(labelA).toHaveAttribute("fill", "black");
  });

  it("applies cutoff correctly", () => {
    const cutoff = { minX: 0, maxX: 2, minY: 0, maxY: 2 };
    const { container } = render(
      <GoBoardView
        boardState={defaultBoardState}
        cutoff={cutoff}
        cellSize={40}
      />,
    );
    const svg = container.querySelector("svg");

    // vw = (2-0)*40 + 40*2 = 80 + 80 = 160
    expect(svg).toHaveAttribute("width", "160");
    expect(svg).toHaveAttribute("height", "160");
    expect(svg).toHaveAttribute("viewBox", "0 0 160 160");

    // 3x3 cutoff should have 3 horizontal and 3 vertical lines = 6 lines
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBe(6);
  });

  it("renders star points (flower points) for 19x19", () => {
    const { container } = render(
      <GoBoardView boardState={defaultBoardState} boardSize={19} />,
    );
    // 19x19 has 9 star points.
    // Star points are black circles without a stroke-width of 1.5px (which stones have).
    const circles = container.querySelectorAll("circle");
    const starPoints = Array.from(circles).filter((c) => {
      const r = parseFloat(c.getAttribute("r") || "0");
      const strokeWidth = c.getAttribute("stroke-width");
      return r < 10 && (!strokeWidth || strokeWidth === "0px");
    });
    expect(starPoints.length).toBe(9);
  });

  it("applies non-square cutoff when aspectIsSquare is false", () => {
    const cutoff = { minX: 0, maxX: 4, minY: 0, maxY: 2 };
    const { container } = render(
      <GoBoardView
        boardState={defaultBoardState}
        cutoff={cutoff}
        cellSize={40}
        aspectIsSquare={false}
      />,
    );
    const svg = container.querySelector("svg");

    // vw = (4-0)*40 + 40*2 = 160 + 80 = 240
    // vh = (2-0)*40 + 40*2 = 80 + 80 = 160
    expect(svg).toHaveAttribute("width", "240");
    expect(svg).toHaveAttribute("height", "160");
  });

  it("renders the icon when provided", () => {
    render(
      <GoBoardView
        boardState={defaultBoardState}
        icon={<span data-testid="test-icon">icon</span>}
      />,
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });
});
