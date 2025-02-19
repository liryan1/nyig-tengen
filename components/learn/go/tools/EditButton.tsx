"use client";

import { Toggle } from "@/components/ui/toggle";
import { EditIcon } from "lucide-react";

interface EditButtonProps {
  disabled?: boolean;
  isEdit?: boolean;
  toggleIsEdit: (pressed: boolean) => void;
}

export function EditButton({
  disabled,
  isEdit,
  toggleIsEdit,
}: EditButtonProps) {
  return (
    <Toggle
      disabled={disabled}
      aria-label="Toggle edit"
      pressed={isEdit}
      onPressedChange={toggleIsEdit}
      variant="outline"
      className="bg-primary-foreground data-[state=on]:bg-orange-300"
    >
      <EditIcon />
    </Toggle>
  );
}
