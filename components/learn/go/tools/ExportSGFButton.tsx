"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DownloadIcon } from "lucide-react";

interface ExportSGFButtonProps {
  className?: string;
  getSgfString?: () => string;
}

export function ExportSGFButton({
  className,
  getSgfString,
}: ExportSGFButtonProps) {
  const downloadTxtFile = () => {
    if (!getSgfString) {
      return;
    }

    const sgfContent = getSgfString();
    const blob = new Blob([sgfContent], { type: "application/x-go-sgf" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "problem.sgf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={downloadTxtFile}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            className,
          )}
        >
          <DownloadIcon />
        </TooltipTrigger>
        <TooltipContent>Download SGF</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
