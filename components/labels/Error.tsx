import { cn } from "@/lib/utils";

export function PageError({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-center items-center p-10 text-xl text-red-500",
        className,
      )}
    >
      {children}
    </div>
  );
}
