import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { truncateString } from "@/lib/utils";
import { AwardIcon } from "lucide-react";

export function EndorsedTooltip({
  endorserName,
  size,
}: {
  endorserName: string;
  size?: number;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <AwardIcon size={size} fill="#FDEE00" strokeWidth={1.5} />
        </TooltipTrigger>
        <TooltipContent>
          Endorsed by: {truncateString(endorserName)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
