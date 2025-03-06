import { Button, ButtonProps } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type CooldownButtonProps = ButtonProps & {
  text: string;
  icon?: React.ReactNode;
  throttleMs?: number;
};

export const CooldownButton = ({
  text,
  icon,
  throttleMs = 3000,
  onClick,
  disabled,
  className,
  ...props
}: CooldownButtonProps) => {
  const [isThrottled, setIsThrottled] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      setIsThrottled(false);
      setCountdown(null);
      return;
    }

    const timer = setTimeout(
      () => setCountdown((prev) => (prev ? prev - 1 : 0)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (onClick) await onClick(event);
    setIsThrottled(true);
    setCountdown(throttleMs / 1000);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isThrottled}
      className={cn("gap-1", className)}
      {...props}
    >
      <span>{text}</span>
      <span className="w-5 h-5 flex items-center justify-center">
        {isThrottled ? <span className="text-sm">{countdown}</span> : icon}
      </span>
    </Button>
  );
};
