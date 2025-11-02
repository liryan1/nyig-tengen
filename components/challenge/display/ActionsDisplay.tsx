// ChallengeButtons.tsx
import { Button } from "@/components/ui/button";
import { CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CHALLEGE_ANSWER_LABEL } from "@/lib/challenge";
import { cn } from "@/lib/utils";
import { ChallengeAnswer } from "@prisma/client";
import { CheckIcon, X } from "lucide-react";
import { memo } from "react";
import { MdQuestionMark } from "react-icons/md";
import { useIsMobile } from "@/hooks/isMobile";

const CHALLENGE_BUTTONS = [
  {
    answer: ChallengeAnswer.DEAD,
    className:
      "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
    icon: X,
  },
  { answer: ChallengeAnswer.UNSETTLED, icon: MdQuestionMark },
  {
    answer: ChallengeAnswer.ALIVE,
    className:
      "text-destructive-foreground shadow-sm bg-green-600 hover:bg-green-500 dark:bg-green-700 dark:hover:bg-green-800",
    icon: CheckIcon,
  },
];

interface ActionsDisplayProps {
  onAnswer: (answer: ChallengeAnswer) => void;
  disabled: boolean;
}

export const ActionsDisplay = memo(
  ({ onAnswer, disabled }: ActionsDisplayProps) => {
    const isMobile = useIsMobile();

    return (
      <>
        <Separator />
        <CardDescription className="text-center mt-2">
          The position is
        </CardDescription>
        <CardFooter className="grid gap-4 p-4 grid-cols-3 sm:gap-6 sm:p-6">
          {CHALLENGE_BUTTONS.map((x) => (
            <Button
              key={x.answer}
              onClick={() => onAnswer(x.answer)}
              disabled={disabled}
              variant="outline"
              size={isMobile ? "sm" : "lg"}
              className={cn(
                "sm:h-10 md:h-12 sm:text-lg font-semibold",
                x.className,
              )}
            >
              <x.icon className="h-6 w-6" />
              {CHALLEGE_ANSWER_LABEL[x.answer]}
            </Button>
          ))}
        </CardFooter>
      </>
    );
  },
);

ActionsDisplay.displayName = "ActionsDisplay";
