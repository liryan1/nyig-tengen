import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PersonalBest } from "@/lib/rtk/slices/challenge";
import { ClockIcon, Rotate3DIcon, TrophyIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChallengeCompleteProps {
  onTryAgain: () => void;
  problemsCorrect: number;
  totalRunTimeMs: number;
  previousPersonalBest?: PersonalBest;
  newPersonalBest?: number;
}

export function ChallengeComplete({
  onTryAgain,
  problemsCorrect,
  totalRunTimeMs,
  previousPersonalBest,
  newPersonalBest,
}: ChallengeCompleteProps) {
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
    <Card className="w-full max-w-md p-4 sm:p-6">
      <div className="space-y-3 sm:space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold">Challenge Complete</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Here&apos;s how you performed
          </p>
        </div>

        <div className="grid gap-2 sm:gap-4">
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-2 sm:p-3">
                <TrophyIcon className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Problems Solved
                </p>
                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <p className="text-xl sm:text-2xl font-bold">
                    {problemsCorrect}
                  </p>
                  {hasScoreImprovement && (
                    <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                      (PB: {previousPersonalBest.problemsCorrect} →{" "}
                      {newPersonalBest})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 sm:p-3">
                <ClockIcon className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Total Time
                </p>
                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <p className="text-xl sm:text-2xl font-bold">
                    {((totalRunTimeMs || 0) / 1000).toFixed(1)}s
                  </p>
                  {hasTimeImprovement && (
                    <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
                      (
                      {(
                        (previousPersonalBest?.timeSpentMs || 0) / 1000
                      ).toFixed(1)}
                      s → {((totalRunTimeMs || 0) / 1000).toFixed(1)}s)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center text-sm sm:text-base">
          💪 Keep practicing
        </div>

        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={handleGoBack}>
            Challenge home
          </Button>
          <Button onClick={onTryAgain}>
            Try Again
            <Rotate3DIcon className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
