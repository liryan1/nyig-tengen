"use client";

import { Button } from "@/components/ui/button";
import { SgfNode } from "@/lib/go/goGame";
import { cn } from "@/lib/utils";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface GoBoardStepperProps {
  rootNode?: SgfNode;
  currentNode?: SgfNode;
  onSelectNode?: (node: SgfNode) => void;
  disabled?: boolean;
  className?: string;
}

export function GoBoardStepper({
  rootNode,
  currentNode,
  onSelectNode,
  disabled,
  className,
}: GoBoardStepperProps) {
  const navIconProps = { className: "w-4 sm:w-5 h-4 sm:h-5", strokeWidth: 3 };
  const navButtonClassName = "h-6 sm:h-8 sm:w-8 p-0 flex-1";

  const handleMoveLeft = (steps: number) => {
    let node = currentNode;
    let moves = steps;
    if (moves <= 0 || !node || !onSelectNode) return;
    while (node.parent && moves > 0) {
      moves--;
      node = node.parent;
    }
    onSelectNode(node);
  };

  const handleMoveRight = (steps: number) => {
    let moves = steps;
    let node = currentNode;
    if (moves <= 0 || !node || !onSelectNode) return;
    while (node?.children?.length && moves > 0) {
      moves--;
      node = node.children[0];
    }
    onSelectNode(node);
  };

  const handleMoveEnd = () => {
    let node = currentNode;
    if (!node || !onSelectNode) return;
    while (node.children?.length) {
      node = node.children[0];
    }
    onSelectNode(node);
  };

  const handleMoveBeg = () => {
    if (!rootNode || !onSelectNode) return;
    onSelectNode(rootNode);
  };

  const leftPaginationComponents = [
    {
      disabled: currentNode === rootNode,
      onClick: handleMoveBeg,
      child: (
        <>
          <span className="sr-only">Clear the go board</span>
          <ChevronFirst {...navIconProps} />
        </>
      ),
    },
    {
      disabled: currentNode === rootNode,
      onClick: () => handleMoveLeft(5),
      child: (
        <>
          <span className="sr-only">Go back five moves</span>
          <ChevronsLeft {...navIconProps} />
        </>
      ),
    },
    {
      disabled: currentNode === rootNode,
      onClick: () => handleMoveLeft(1),
      child: (
        <>
          <span className="sr-only">Go back one move</span>
          <ChevronLeft {...navIconProps} />
        </>
      ),
    },
  ];

  const rightPaginationComponents = [
    {
      disabled: !currentNode?.children?.length,
      onClick: () => handleMoveRight(1),
      child: (
        <>
          <span className="sr-only">Go to the next move</span>
          <ChevronRight {...navIconProps} />
        </>
      ),
    },
    {
      disabled: !currentNode?.children?.length,
      onClick: () => handleMoveRight(5),
      child: (
        <>
          <span className="sr-only">Go forward five moves</span>
          <ChevronsRight {...navIconProps} />
        </>
      ),
    },
    {
      disabled: !currentNode?.children?.length,
      onClick: handleMoveEnd,
      child: (
        <>
          <span className="sr-only">Go to the last move</span>
          <ChevronLast {...navIconProps} />
        </>
      ),
    },
  ];

  return (
    <div className={cn("flex items-center justify-center w-full", className)}>
      <div className="flex items-center w-full">
        {leftPaginationComponents.map((c, i) => (
          <Button
            key={`left-pagination-${i}`}
            variant="outline"
            className={navButtonClassName}
            onClick={c.onClick}
            disabled={c.disabled || disabled}
          >
            {c.child}
          </Button>
        ))}
        {rightPaginationComponents.map((c, i) => (
          <Button
            key={`right-pagination-${i}`}
            variant="outline"
            className={navButtonClassName}
            onClick={c.onClick}
            disabled={c.disabled || disabled}
          >
            {c.child}
          </Button>
        ))}
      </div>
    </div>
  );
}
