"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Toggle, toggleVariants } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BoardEditTool } from "@/hooks/useGo";
import { cn } from "@/lib/utils";
import {
  ArrowRightLeftIcon,
  CircleIcon,
  EditIcon,
  EraserIcon,
} from "lucide-react";

const buttonStyle =
  "bg-background shadow-sm hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-node-highlight";

interface EditButtonProps {
  disabled?: boolean;
  isEdit?: boolean;
  toggleIsEdit: (pressed: boolean) => void;
  editTool?: BoardEditTool;
  onEditToolChange?: (editTool: BoardEditTool) => void;
  onSwapColorChange?: () => void;
}

export function EditButton({
  disabled,
  isEdit,
  toggleIsEdit,
  editTool,
  onEditToolChange,
  onSwapColorChange,
}: EditButtonProps) {
  return (
    <div className="relative">
      {isEdit && (
        <div className="absolute bottom-full flex items-center gap-1 h-full">
          <ToggleGroup
            type="single"
            value={editTool}
            onValueChange={(value: BoardEditTool) =>
              onEditToolChange && onEditToolChange(value)
            }
            className="gap-0"
          >
            <ToggleGroupItem
              value="black"
              aria-label="Add black stone"
              variant="outline"
              className={buttonStyle}
            >
              <CircleIcon fill="black" size={30} strokeWidth={1} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="white"
              aria-label="Add white stone"
              variant="outline"
              className={buttonStyle}
            >
              <CircleIcon fill="white" size={30} strokeWidth={1} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="erase"
              aria-label="Erase stone"
              variant="outline"
              className={buttonStyle}
            >
              <EraserIcon />
            </ToggleGroupItem>
          </ToggleGroup>
          <Separator className="" orientation="vertical" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className={cn(
                  toggleVariants({ variant: "outline" }),
                  buttonStyle,
                  "cursor-pointer",
                )}
                type="button"
                onClick={() => onSwapColorChange && onSwapColorChange()}
              >
                <ArrowRightLeftIcon />
              </TooltipTrigger>
              <TooltipContent>Swap black & white</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      <Toggle
        disabled={disabled}
        aria-label="Toggle edit"
        pressed={isEdit}
        onPressedChange={toggleIsEdit}
        variant="outline"
        className={buttonStyle}
      >
        <EditIcon />
      </Toggle>
    </div>
  );
}
