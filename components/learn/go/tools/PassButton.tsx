import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { HandIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  onClick?: () => void;
}

export function PassButton({ onClick }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          type="button"
          onClick={onClick}
          className={cn(
            toggleVariants({ variant: "outline" }),
            "cursor-pointer bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <HandIcon />
        </TooltipTrigger>
        <TooltipContent>Pass</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
