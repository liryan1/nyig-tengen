import { cn, formatLargeNumber } from "@/lib/utils";
import {
  CalculatorIcon,
  EyeIcon,
  HeartIcon,
  SignatureIcon,
  SquareActivityIcon,
  SwordsIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { SucessRate } from "./problem/SucessRate";
import { LIKED_COLOR } from "@/lib/color";
import { UserRole } from "@prisma/client";
import { PiCrownSimple } from "react-icons/pi";

interface InfoBarProps {
  info: {
    author?: { name: string; id: string; role: string };
    rank?: string;
    likes?: number;
    userLiked?: boolean;
    views?: number;
    count?: number;
    rate?: number;
    userSolved?: boolean;
    convertRateToPercent?: boolean;
  };
  size?: "sm";
  moreStuff?: React.ReactNode[];
  toggleLike?: () => void;
  likeDisabled?: boolean;
}

export function InfoBar({
  info,
  moreStuff,
  size,
  toggleLike,
  likeDisabled,
}: InfoBarProps) {
  const {
    rank,
    likes,
    views,
    author,
    count,
    rate,
    userSolved,
    convertRateToPercent,
  } = info;

  const iconCN = "flex items-center gap-1";
  const iconSize = size ? 16 : 18;
  const textSize = size ? "text-xs sm:text-sm" : "text-xs sm:text-base";
  const isAuthorAdmin =
    author && (author.role === UserRole.ADMIN || UserRole.SUPERADMIN);

  return (
    <div
      className={cn("flex flex-wrap justify-between gap-2 sm:gap-6", textSize)}
    >
      {author && (
        <div className={iconCN}>
          <SignatureIcon size={iconSize} />
          <Link className="flex items-center gap-0.5" href="#">
            {author.name}
            {isAuthorAdmin && (
              <PiCrownSimple className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
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
        <div
          className={cn(iconCN, toggleLike ? "cursor-pointer" : "")}
          onClick={!likeDisabled ? toggleLike : undefined}
        >
          <HeartIcon
            size={iconSize}
            fill={info.userLiked ? LIKED_COLOR : "none"}
          />
          <span>{formatLargeNumber(likes)}</span>
        </div>
      )}

      {rate !== undefined && (
        <SucessRate
          successRate={rate}
          userSolved={userSolved}
          convertToPercent={convertRateToPercent}
        />
      )}

      {moreStuff?.map((c, i) => (
        <div key={i} className={iconCN}>
          {c}
        </div>
      ))}
    </div>
  );
}
