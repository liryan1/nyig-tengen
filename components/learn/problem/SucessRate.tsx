import { SUCCESS_COLOR } from "@/lib/color";
import { CircleCheckBigIcon } from "lucide-react";

export function SucessRate({
  userSolved,
  successRate,
  convertToPercent,
}: {
  userSolved?: boolean;
  successRate?: number;
  convertToPercent?: boolean;
}) {
  const rate = !successRate || isNaN(successRate) ? 0 : successRate;

  return (
    <div
      className="flex items-center space-x-1"
      style={{
        color: userSolved ? SUCCESS_COLOR : undefined,
        fontWeight: userSolved ? 600 : undefined,
      }}
    >
      <CircleCheckBigIcon size={16} strokeWidth={userSolved ? 3 : undefined} />
      <span>
        {convertToPercent ? (rate * 100).toFixed(1) : rate}
        {convertToPercent && "%"}
      </span>
    </div>
  );
}
