"use client";

import { StoneColor } from "@/lib/go/interface";
import { CircleIcon } from "lucide-react";

interface StoneSwitchProps {
  disabled?: boolean;
  stone: StoneColor;
  onSwitchStone: (stone: StoneColor) => void;
}

export function StoneSwitch({
  disabled,
  stone,
  onSwitchStone,
}: StoneSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onSwitchStone(stone === 1 ? -1 : 1)}
      className={`
        relative h-9 w-9
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      `}
      disabled={disabled}
      aria-label="Stone color switch"
    >
      <div className="relative w-full h-full">
        <CircleIcon
          fill="white"
          size={30}
          strokeWidth={1}
          className={`
            absolute top-1/2 -translate-y-1/2 left-[calc(100%-2.4rem)]
            transition-all duration-300
            ${stone === -1 ? "z-20" : "z-10"}
          `}
        />
        <CircleIcon
          fill="black"
          size={30}
          strokeWidth={1}
          className={`
            absolute top-1/2 -translate-y-1/2 right-[calc(100%-2.4rem)]
            transition-all duration-300
            ${stone === 1 ? "z-20" : "z-10"}
          `}
        />
      </div>
    </button>
  );
}
