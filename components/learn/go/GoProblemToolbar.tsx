"use client";

import { SgfNode } from "@/lib/go/goGame";
import React from "react";
import { GoBoardStepper } from "./board/GoBoardStepper";
import { NodeVisualizer } from "./node/NodeVisualizer";

interface GoProblemToolbarProps {
  key?: number;
  rootNode: SgfNode;
  currentNode: SgfNode;
  onSelectNode: (node: SgfNode) => void;
  onDeleteNode?: (node: SgfNode) => void;
  children?: React.ReactNode | React.ReactNode[];
}

export function GoProblemToolbar({
  rootNode,
  currentNode,
  onSelectNode,
  onDeleteNode,
  children,
}: GoProblemToolbarProps) {
  return (
    <div className="h-full relative bg-yellow-50 dark:bg-slate-700 flex flex-col">
      <GoBoardStepper
        rootNode={rootNode}
        currentNode={currentNode}
        onSelectNode={onSelectNode}
      />
      <div className="w-full overflow-auto flex-1">
        <NodeVisualizer
          onDeleteNode={onDeleteNode}
          rootNode={rootNode}
          currentNode={currentNode}
          onSelectNode={onSelectNode}
          columnWidth={40}
          rowHeight={40}
        />
      </div>
      <div className="w-full sticky bottom-0 flex justify-between mt-auto pb-1 sm:px-1">
        {children}
      </div>
    </div>
  );
}
