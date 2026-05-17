import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NodeBox } from "@/components/learn/go/node/NodeBox";
import { SgfNode } from "@/lib/go/goGame";

describe("NodeBox", () => {
  it("renders a TriangleIcon for root node", () => {
    const root: SgfNode = { children: [] };
    const { container } = render(
      <NodeBox node={root} isCurrent={false} size={30} onClick={() => {}} />,
    );
    // TriangleIcon is a Lucide icon which renders an svg
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders move number for move nodes", () => {
    const root: SgfNode = { children: [] };
    const move: SgfNode = {
      parent: root,
      moveCoord: "aa",
      moveColor: 1,
      children: [],
    };
    render(
      <NodeBox node={move} isCurrent={false} size={30} onClick={() => {}} />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("applies highlight background when isCurrent is true", () => {
    const root: SgfNode = { children: [] };
    const { container } = render(
      <NodeBox node={root} isCurrent={true} size={30} onClick={() => {}} />,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toBe("rgba(255, 165, 0, 0.3)");
  });

  it("calls onClick when clicked", () => {
    const root: SgfNode = { children: [] };
    const handleClick = vi.fn();
    const { container } = render(
      <NodeBox node={root} isCurrent={false} size={30} onClick={handleClick} />,
    );
    fireEvent.click(container.firstChild!);
    expect(handleClick).toHaveBeenCalled();
  });

  it("renders black circle for black move", () => {
    const root: SgfNode = { children: [] };
    const move: SgfNode = {
      parent: root,
      moveCoord: "aa",
      moveColor: 1,
      children: [],
    };
    render(
      <NodeBox node={move} isCurrent={false} size={30} onClick={() => {}} />,
    );
    const circle = screen.getByText("1");
    // JSDOM might return 'black' or 'rgb(0, 0, 0)'
    expect(["black", "rgb(0, 0, 0)"]).toContain(
      circle.style.backgroundColor || circle.style.background,
    );
    expect(["white", "rgb(255, 255, 255)"]).toContain(circle.style.color);
  });

  it("renders white circle for white move", () => {
    const root: SgfNode = { children: [] };
    const move: SgfNode = {
      parent: root,
      moveCoord: "aa",
      moveColor: -1,
      children: [],
    };
    render(
      <NodeBox node={move} isCurrent={false} size={30} onClick={() => {}} />,
    );
    const circle = screen.getByText("1");
    expect(["white", "rgb(255, 255, 255)"]).toContain(
      circle.style.backgroundColor || circle.style.background,
    );
    expect(["black", "rgb(0, 0, 0)"]).toContain(circle.style.color);
  });
});
