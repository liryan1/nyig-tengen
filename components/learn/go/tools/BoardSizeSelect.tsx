import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOARD_SIZES } from "@/lib/go/constants";

interface BoardSizeSelectProps {
  size: number;
  onChange: (size: number) => void;
}

export function BoardSizeSelect({ size, onChange }: BoardSizeSelectProps) {
  return (
    <Select
      value={size.toString()}
      onValueChange={(value) => onChange(parseInt(value))}
    >
      <SelectTrigger className="w-20 bg-primary-foreground h-8 p-0 px-2">
        <SelectValue placeholder="Select rank" />
      </SelectTrigger>
      <SelectContent>
        {BOARD_SIZES.map((o) => (
          <SelectItem key={o} value={o.toString()}>
            {o}x{o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
