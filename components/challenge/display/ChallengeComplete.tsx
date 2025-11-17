import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/isMobile";
import { PersonalBest } from "@/lib/rtk/slices/challenge";
import { ClockIcon, HomeIcon, Rotate3DIcon, TrophyIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { BoardDisplay } from "./BoardDisplay";

interface ChallengeCompleteProps {
  onTryAgain: () => void;
  problemsCorrect: number;
  totalRunTimeMs: number;
  previousPersonalBest?: PersonalBest;
  newPersonalBest?: number;
  lastProblemSgf?: string;
  isLastProblem?: boolean;
}

export function ChallengeComplete({
  onTryAgain,
  problemsCorrect,
  totalRunTimeMs,
  previousPersonalBest,
  newPersonalBest,
  lastProblemSgf,
  isLastProblem,
}: ChallengeCompleteProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/challenge");
  };

  const hasScoreImprovement =
    previousPersonalBest !== undefined &&
    newPersonalBest !== undefined &&
    newPersonalBest > previousPersonalBest.problemsCorrect;

  const hasTimeImprovement =
    problemsCorrect === newPersonalBest &&
    previousPersonalBest?.timeSpentMs !== undefined &&
    totalRunTimeMs < previousPersonalBest?.timeSpentMs;

  return (
    <Card className="w-full max-w-md p-2 sm:p-4">
      <h2 className="text-md sm:text-xl text-center font-semibold pb-2 sm:pb-4">
        Challenge Completed
      </h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-2 sm:p-3">
            <TrophyIcon className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground">Solved</p>
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <p className="text-lg sm:text-xl font-bold">{problemsCorrect}</p>
              {hasScoreImprovement && (
                <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                  (PB: {previousPersonalBest.problemsCorrect} →{" "}
                  {newPersonalBest})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Total Time
            </p>
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap justify-end">
              <p className="text-lg sm:text-xl font-bold">
                {((totalRunTimeMs || 0) / 1000).toFixed(1)}s
              </p>
              {hasTimeImprovement && (
                <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
                  (
                  {((previousPersonalBest?.timeSpentMs || 0) / 1000).toFixed(1)}
                  s → {((totalRunTimeMs || 0) / 1000).toFixed(1)}s)
                </span>
              )}
            </div>
          </div>
          <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 sm:p-3">
            <ClockIcon className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {lastProblemSgf && (
        <div className="flex justify-center">
          <div className={isMobile ? "h-60 w-60" : "h-80 w-80"}>
            <BoardDisplay sgf={lastProblemSgf} />
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleGoBack}
          size={isMobile ? "sm" : undefined}
        >
          <HomeIcon className="mr-0.5 w-4 h-4" />
          Go back
        </Button>
        <Button onClick={onTryAgain} size={isMobile ? "sm" : undefined}>
          Try Again
          <Rotate3DIcon className="ml-0.5 w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
