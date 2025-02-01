import { cn, formatLargeNumber } from "@/lib/utils";
import {
  CalculatorIcon,
  CheckCircleIcon,
  EyeIcon,
  HeartIcon,
  SignatureIcon,
  SquareActivityIcon,
  SwordsIcon,
} from "lucide-react";
import Link from "next/link";

interface InfoBarProps {
  info: {
    author?: { name: string; id: string };
    rank?: string;
    likes?: number;
    views?: number;
    count?: number;
    rate?: number;
  };
  size?: "sm";
  moreStuff?: React.ReactNode[];
}

export function InfoBar({ info, moreStuff, size }: InfoBarProps) {
  const { rank, likes, views, author, count, rate } = info;

  const iconCN = "flex items-center space-x-1";
  const iconSize = size ? 16 : 18;
  const textSize = size ? "text-xs sm:text-sm" : "text-xs sm:text-base";

  return (
    <div
      className={cn("flex flex-wrap justify-between gap-2 sm:gap-6", textSize)}
    >
      {author && (
        <div className={iconCN}>
          <SignatureIcon size={iconSize} />
          <Link className="hover:underline" href="#">
            {author.name}
          </Link>
        </div>
      )}

      {rank !== undefined && (
        <div className={iconCN}>
          <SwordsIcon size={iconSize} />
          <span>{rank}</span>
        </div>
      )}

      {count !== undefined && (
        <div className={iconCN}>
          <CalculatorIcon size={iconSize} />
          <span>{count}</span>
        </div>
      )}

      {views !== undefined && (
        <div className={iconCN}>
          <EyeIcon size={iconSize} />
          <span>{formatLargeNumber(views)}</span>
        </div>
      )}

      {likes !== undefined && (
        <div className={iconCN}>
          <HeartIcon size={iconSize} />
          <span>{formatLargeNumber(likes)}</span>
        </div>
      )}

      {rate !== undefined && (
        <div className={iconCN}>
          <SquareActivityIcon size={iconSize} />
          <span>{(rate * 100).toFixed(1)}%</span>
        </div>
      )}

      {moreStuff?.map((c, i) => (
        <div key={i} className={iconCN}>
          {c}
        </div>
      ))}
    </div>
  );
}
