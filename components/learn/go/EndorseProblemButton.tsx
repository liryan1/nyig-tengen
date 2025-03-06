import { CooldownButton } from "@/components/CooldownButton";
import { Spinner } from "@/components/labels/Spinner";
import { LIKED_COLOR, SUCCESS_COLOR } from "@/lib/color";
import { useEndorseMutation } from "@/lib/rtk/slices/problems";
import { ShieldCheckIcon, ShieldXIcon } from "lucide-react";
import { toast } from "sonner";

export interface EndorseProblemButtonProps {
  problemNum: string;
  isEndorsed?: boolean;
  endorsedNotByUser?: boolean;
}

export function EndorseProblemButton({
  problemNum,
  isEndorsed,
  endorsedNotByUser,
}: EndorseProblemButtonProps) {
  const [endorse, { isLoading }] = useEndorseMutation();

  const handleEndorse = async () => {
    toast.promise(endorse(problemNum).unwrap(), {
      error: (err) => `Failed to endorse problem: ${err?.data?.message}`,
      loading: "Endorsing problem ...",
      success: (response) =>
        response.endorsed ? "Endorsed problem" : "Unendorsed problem",
      action: {
        label: "Undo",
        onClick: () => endorse(problemNum).unwrap(),
      },
      duration: 5_000,
    });
  };

  const buttonIcon = isEndorsed ? (
    <ShieldXIcon fill={LIKED_COLOR} />
  ) : (
    <ShieldCheckIcon fill={SUCCESS_COLOR} />
  );
  return (
    <CooldownButton
      throttleMs={5_000}
      size="sm"
      text={isEndorsed ? "Unendorse" : "Endorse"}
      icon={isLoading ? <Spinner className="h-4 w-4" /> : buttonIcon}
      onClick={handleEndorse}
      disabled={isEndorsed && endorsedNotByUser}
    />
  );
}
