import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { HandIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonProps } from "@/components/ui/button";

export function PassButton({ className, ...props }: ButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          {...props}
          type="button"
          className={cn(
            toggleVariants({ variant: "outline" }),
            "cursor-pointer bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
            className,
          )}
        >
          <HandIcon />
        </TooltipTrigger>
        <TooltipContent>Pass</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
