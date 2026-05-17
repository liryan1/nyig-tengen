import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NodeVisualizer } from "@/components/learn/go/node/NodeVisualizer";
import { SgfNode } from "@/lib/go/goGame";

describe("NodeVisualizer", () => {
  const root: SgfNode = { children: [], moveColor: 0 };
  const move1: SgfNode = {
    parent: root,
    children: [],
    moveCoord: "aa",
    moveColor: 1,
  };
  root.children.push(move1);

  it("renders nodes and edges", () => {
    const { container } = render(
      <NodeVisualizer
        rootNode={root}
        currentNode={root}
        onSelectNode={() => {}}
      />,
    );

    // Should have 2 NodeBox elements (root and move1)
    // NodeBox for root has TriangleIcon (svg)
    // NodeBox for move1 has move number "1"
    expect(screen.getByText("1")).toBeInTheDocument();

    // Edges are paths inside the main svg.
    // Lucide icons also use paths inside their own svgs.
    // The edges are in the FIRST svg in NodeVisualizer.
    const edgeSvg = container.querySelector("svg");
    expect(edgeSvg?.querySelectorAll("path").length).toBe(1);
  });

  it("calls onSelectNode when a node is clicked", () => {
    const onSelect = vi.fn();
    render(
      <NodeVisualizer
        rootNode={root}
        currentNode={root}
        onSelectNode={onSelect}
      />,
    );

    fireEvent.click(screen.getByText("1").parentElement!);
    expect(onSelect).toHaveBeenCalledWith(move1);
  });

  it("navigates with arrow keys", () => {
    const onSelect = vi.fn();
    render(
      <NodeVisualizer
        rootNode={root}
        currentNode={root}
        onSelectNode={onSelect}
      />,
    );

    // From root, ArrowRight should select child
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onSelect).toHaveBeenCalledWith(move1);

    // From move1, ArrowLeft should select parent
    onSelect.mockClear();
    render(
      <NodeVisualizer
        rootNode={root}
        currentNode={move1}
        onSelectNode={onSelect}
      />,
    );
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onSelect).toHaveBeenCalledWith(root);
  });
});
