"use client";

import { useShowCoord } from "@/components/providers/ShowCoordProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buttonVariants } from "../ui/button";

export function ShowCoordButton() {
  const { toggleShowCoord, showCoord } = useShowCoord();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={toggleShowCoord}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <span className={showCoord ? "line-through" : ""}>A1</span>
        </TooltipTrigger>
        <TooltipContent>Show coordinates</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
