import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  h?: number;
}

interface LogoWithTextProps extends LogoProps {
  text: string;
  school?: string;
  className?: string;
}

export function LogoWithText({
  h,
  text,
  school,
  className,
}: LogoWithTextProps) {
  return (
    <div
      className={cn(className, "flex items-center gap-2 text-2xl sm:text-3xl")}
    >
      <Logo h={h} />
      <div className="relative">
        {text}
        <div className="items-end absolute right-0 bottom-[-15] sm:bottom-[-18] text-[8px] md:text-[10px] text-muted-foreground">
          {school}
        </div>
      </div>
    </div>
  );
}

export function Logo({ h }: LogoProps) {
  return (
    <Image
      className="p-0 m-0"
      src="/logo.png"
      height={h ?? "40"}
      width={h ?? "40"}
      alt=""
    />
  );
}
