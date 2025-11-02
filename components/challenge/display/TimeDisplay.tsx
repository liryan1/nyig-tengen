import { cn } from "@/lib/utils";
import { memo } from "react";

interface TimerDisplayProps {
  remainingTimeMs: number;
}

export const TimerDisplay = memo(({ remainingTimeMs }: TimerDisplayProps) => {
  const isLowTime = remainingTimeMs < 5000;

  return (
    <div
      className={cn(
        "text-lg sm:text-2xl font-semibold tabular-nums text-primary transition-colors",
        isLowTime && "text-destructive animate-pulse",
      )}
    >
      {(remainingTimeMs / 1000).toFixed(1)}s
    </div>
  );
});

TimerDisplay.displayName = "TimerDisplay";
