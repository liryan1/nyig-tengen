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
    <div className={cn(className, "flex items-center gap-2")}>
      <Logo h={h} />
      <div className="relative">
        <div className="text-2xl sm:text-3xl">{text}</div>
        <div className="items-end absolute right-0 bottom-[-5px] sm:bottom-[-8px] text-[8px] md:text-[10px] text-muted-foreground">
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
