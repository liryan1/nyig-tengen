import { CircleCheckBigIcon } from "lucide-react";

export function ProblemCardSucessRate({
  userSolved,
  successRate,
}: {
  userSolved?: boolean;
  successRate?: number;
}) {
  return (
    <div
      className="flex items-center space-x-1"
      style={{
        color: userSolved ? "#16a34a" : undefined,
        fontWeight: userSolved ? 600 : undefined,
      }}
    >
      <CircleCheckBigIcon size={16} strokeWidth={userSolved ? 3 : undefined} />
      <span>
        {((!successRate || isNaN(successRate) ? 0 : successRate) * 100).toFixed(
          1,
        )}
        %
      </span>
    </div>
  );
}
