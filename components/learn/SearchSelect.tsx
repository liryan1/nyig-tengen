"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchSelectProps {
  triggerClassName?: string;
  contentClassName?: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  icon?: React.ReactNode;
  options: {
    value: string;
    label: string;
  }[];
}

export function SearchSelect({
  triggerClassName,
  contentClassName,
  value,
  onValueChange,
  options,
  disabled,
  emptyMessage = "No options found",
  placeholder = "Select an option",
  icon,
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", triggerClassName)}
        >
          <div className="flex items-center gap-1 overflow-hidden">
            {icon}
            <span className="truncate">
              {value
                ? options.find((option) => option.value === value)?.label
                : placeholder}
            </span>
          </div>
          <ChevronsUpDown className="opacity-50 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", contentClassName)}>
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
