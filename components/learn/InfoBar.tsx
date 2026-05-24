import { LIKED_COLOR, STAR_COLOR } from "@/lib/color";
import { cn, formatLargeNumber } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import {
  CalculatorIcon,
  EyeIcon,
  HeartIcon,
  SignatureIcon,
  StarIcon,
  SwordsIcon,
} from "lucide-react";
import Link from "next/link";
import { PiCrownSimple } from "react-icons/pi";
import { SuccessRate } from "./problem/SuccessRate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoBarProps {
  info: {
    author?: { name: string; id: string; role: string };
    rank?: string;
    likes?: number;
    userLiked?: boolean;
    userStarred?: boolean;
    views?: number;
    count?: number;
    rate?: number;
    userSolved?: boolean;
    convertRateToPercent?: boolean;
  };
  size?: "sm";
  moreStuff?: React.ReactNode[];
  toggleLike?: () => void;
  toggleStar?: () => void;
  likeDisabled?: boolean;
  starDisabled?: boolean;
  readonly?: boolean;
}

export function InfoBar({
  info,
  moreStuff,
  size,
  toggleLike,
  toggleStar,
  likeDisabled,
  starDisabled,
  readonly,
}: InfoBarProps) {
  const {
    rank,
    likes,
    views,
    author,
    count,
    rate,
    userSolved,
    userStarred,
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
        <InfoBarItem
          disabled={readonly}
          label="Difficulty"
          trigger={
            <div className={iconCN}>
              <SwordsIcon size={iconSize} />
              <span>{rank}</span>
            </div>
          }
        />
      )}

      {count !== undefined && (
        <InfoBarItem
          disabled={readonly}
          label="Problem count"
          trigger={
            <div className={iconCN}>
              <CalculatorIcon size={iconSize} />
              <span>{count}</span>
            </div>
          }
        />
      )}

      {views !== undefined && (
        <span className="hidden sm:flex">
          <InfoBarItem
            disabled={readonly}
            label="View count"
            trigger={
              <div className={iconCN}>
                <EyeIcon size={iconSize} />
                <span>{formatLargeNumber(views)}</span>
              </div>
            }
          />
        </span>
      )}

      {likes !== undefined && (
        <InfoBarItem
          disabled={likeDisabled || readonly}
          label={info.userLiked ? "Unlike problem" : "Like problem"}
          trigger={
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
          }
        />
      )}

      <InfoBarItem
        disabled={starDisabled || readonly}
        label={userStarred ? "Remove from favorites" : "Add to favorites"}
        trigger={
          <div
            className={cn(iconCN, toggleStar ? "cursor-pointer" : "")}
            onClick={!starDisabled ? toggleStar : undefined}
          >
            <StarIcon
              size={iconSize}
              fill={userStarred ? STAR_COLOR : "none"}
            />
          </div>
        }
      />

      {rate !== undefined && (
        <span className="hidden sm:flex">
          <InfoBarItem
            disabled={readonly}
            label="Attempt success"
            trigger={
              <SuccessRate
                successRate={rate}
                userSolved={userSolved}
                convertToPercent={convertRateToPercent}
              />
            }
          />
        </span>
      )}

      {moreStuff?.map((c, i) => (
        <div key={i} className={iconCN}>
          {c}
        </div>
      ))}
    </div>
  );
}

export function InfoBarItem({
  label,
  trigger,
  disabled,
}: {
  label: string;
  trigger: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          disabled={disabled}
          type="button"
          className={cn(
            "cursor-default",
            disabled ? "pointer-events-none" : "",
          )}
        >
          {trigger}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
