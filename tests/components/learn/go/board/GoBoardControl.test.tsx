import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GoBoardControl } from "@/components/learn/go/board/GoBoardControl";
import { BoardState } from "@/lib/go/interface";

describe("GoBoardControl", () => {
  const defaultBoardState: BoardState = {
    stones: {},
    labels: {},
    boardSize: 19,
  };

  it("calls onMove when clicking an empty intersection", () => {
    const onMove = vi.fn();
    const { container } = render(
      <GoBoardControl
        boardState={defaultBoardState}
        boardSize={19}
        cellSize={40}
        onMove={onMove}
        nextPlayer={1}
      />,
    );

    const circle = container.querySelector("circle[cx='40'][cy='40']");
    fireEvent.click(circle!);

    expect(onMove).toHaveBeenCalledWith(0, 0);
  });

  it("shows preview stone on hover", () => {
    const { container } = render(
      <GoBoardControl
        boardState={defaultBoardState}
        nextPlayer={1}
        cellSize={40}
      />,
    );

    const circle = container.querySelector("circle[cx='40'][cy='40']");
    fireEvent.mouseEnter(circle!);

    expect(circle).toHaveAttribute("fill", "black");
    expect(circle).toHaveAttribute("opacity", "0.75");

    fireEvent.mouseLeave(circle!);
    expect(circle).toHaveAttribute("fill", "transparent");
  });

  it("does not trigger onMove when readonly is true", () => {
    const onMove = vi.fn();
    const { container } = render(
      <GoBoardControl
        boardState={defaultBoardState}
        readonly={true}
        onMove={onMove}
        cellSize={40}
      />,
    );

    const circle = container.querySelector("circle[cx='40'][cy='40']");
    fireEvent.click(circle!);
    expect(onMove).not.toHaveBeenCalled();
  });
});
