import { Button } from "@/components/ui/button";
import { SgfNode } from "@/lib/go/goGame";
import { SendHorizonalIcon } from "lucide-react";
import { ExportSGFButton } from "./node/ExportSGFButton";
import { NodeVisualizer } from "./node/NodeVisualizer";
import { GoBoardStepper } from "./board/GoBoardStepper";

interface GoProblemToolbarProps {
  rootNode: SgfNode;
  currentNode: SgfNode;
  onSubmitAnswer: () => void;
  onSelectNode: (node: SgfNode) => void;
  getSgf: () => string;
}

export function GoProblemToolbar({
  rootNode,
  currentNode,
  onSelectNode,
  onSubmitAnswer,
  getSgf,
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
          rootNode={rootNode}
          currentNode={currentNode}
          onSelectNode={onSelectNode}
          columnWidth={40}
          rowHeight={40}
        />
      </div>
      <div className="w-full sticky bottom-0 sm:bottom-1 flex justify-between mt-auto sm:px-2">
        <ExportSGFButton
          className="sticky left-0 sm:left-1 bottom-0 sm:bottom-1"
          getSgfString={getSgf}
        />
        <Button
          size="sm"
          onClick={onSubmitAnswer}
          className="sticky right-1 bottom-1"
        >
          Submit
          <SendHorizonalIcon />
        </Button>
      </div>
    </div>
  );
}
