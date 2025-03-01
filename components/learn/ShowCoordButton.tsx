"use client";

import { useShowCoord } from "@/components/providers/ShowCoordProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

export function ShowCoordButton({ className }: { className?: string }) {
  const { toggleShowCoord, showCoord } = useShowCoord();
  const text = (showCoord ? "Hide" : "Show") + " coordinates";
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={toggleShowCoord}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            className,
          )}
        >
          <span className={showCoord ? "" : "line-through"}>A1</span>
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
