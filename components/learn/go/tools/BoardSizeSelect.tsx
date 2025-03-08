import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BOARD_SIZES } from "@/lib/go/constants";
import { CircleAlertIcon } from "lucide-react";

interface BoardSizeSelectProps {
  isBoardEmpty?: boolean;
  size: number | null;
  onChange: (size: number) => void;
}

export function BoardSizeSelect({
  isBoardEmpty,
  size,
  onChange,
}: BoardSizeSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(size);

  const handleSelect = (value: string) => {
    const newSize = parseInt(value);
    if (!newSize || isNaN(newSize)) {
      return;
    }
    if (isBoardEmpty) {
      onChange(newSize);
    } else {
      setSelectedSize(newSize);
      setOpen(true);
    }
  };

  const handleConfirm = () => {
    if (selectedSize) {
      onChange(selectedSize);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedSize(size);
    setOpen(false);
  };

  return (
    <>
      <Select value={size?.toString()} onValueChange={handleSelect}>
        <SelectTrigger className="w-[4.5rem] h-8 p-0 px-2 bg-background hover:bg-accent hover:text-accent-foreground">
          <SelectValue placeholder="Select rank" />
        </SelectTrigger>
        <SelectContent align="end">
          {BOARD_SIZES.map((o) => (
            <SelectItem key={o} value={o.toString()}>
              {o}x{o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-4">
          <DialogHeader>
            <DialogTitle>Confirm Board Size</DialogTitle>
          </DialogHeader>
          <div className="text-sm flex items-center gap-1 text-red-500">
            <CircleAlertIcon />
            Existing data may be significantly altered.
          </div>
          <p className="text-sm">
            Coordinates begin in the upper left corner and changing the board
            size can have unexpected behavior. Are you sure you want to change
            the board size to {selectedSize}x{selectedSize}?
          </p>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
        <DialogDescription className="hidden">
          Board Resize warning
        </DialogDescription>
      </Dialog>
    </>
  );
}
