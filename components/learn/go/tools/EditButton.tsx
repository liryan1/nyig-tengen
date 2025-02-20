"use client";

import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BoardEditTool } from "@/hooks/useGo";
import { CircleIcon, EditIcon, EraserIcon } from "lucide-react";

interface EditButtonProps {
  disabled?: boolean;
  isEdit?: boolean;
  toggleIsEdit: (pressed: boolean) => void;
  editTool?: BoardEditTool;
  onEditToolChange?: (editTool: BoardEditTool) => void;
}

export function EditButton({
  disabled,
  isEdit,
  toggleIsEdit,
  editTool,
  onEditToolChange,
}: EditButtonProps) {
  return (
    <div className="relative">
      {isEdit && (
        <ToggleGroup
          type="single"
          value={editTool}
          onValueChange={(value: BoardEditTool) =>
            onEditToolChange && onEditToolChange(value)
          }
          className="absolute bottom-full flex items-center gap-0 bg-primary-foreground"
        >
          <ToggleGroupItem
            value="black"
            aria-label="Add black stone"
            variant="outline"
            className="data-[state=on]:bg-node-highlight"
          >
            <CircleIcon fill="black" size={30} strokeWidth={1} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="white"
            aria-label="Add white stone"
            variant="outline"
            className="data-[state=on]:bg-node-highlight"
          >
            <CircleIcon fill="white" size={30} strokeWidth={1} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="erase"
            aria-label="Erase stone"
            variant="outline"
            className="data-[state=on]:bg-node-highlight"
          >
            <EraserIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      )}
      <Toggle
        disabled={disabled}
        aria-label="Toggle edit"
        pressed={isEdit}
        onPressedChange={toggleIsEdit}
        variant="outline"
        className="bg-primary-foreground data-[state=on]:bg-node-highlight"
      >
        <EditIcon />
      </Toggle>
    </div>
  );
}
