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
  const { toggleShowCoord } = useShowCoord();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={toggleShowCoord}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          A1
        </TooltipTrigger>
        <TooltipContent>Show coordinates</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
