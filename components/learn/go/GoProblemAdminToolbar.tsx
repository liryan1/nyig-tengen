"use client";
import { Button } from "@/components/ui/button";
import { EditIcon } from "lucide-react";
import Link from "next/link";
import {
  EndorseProblemButton,
  type EndorseProblemButtonProps,
} from "./EndorseProblemButton";

interface GoProblemAdminToolbarProps extends EndorseProblemButtonProps {
  isSuperAdmin?: boolean;
  userOwnsProblem?: boolean;
  endorsedNotByUser?: boolean;
}

export function GoProblemAdminToolbar({
  isSuperAdmin,
  isEndorsed,
  problemNum,
  userOwnsProblem,
  endorsedNotByUser,
}: GoProblemAdminToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2 p-2 sm:gap-4 sm:p-4">
      {isSuperAdmin && (
        <EndorseProblemButton
          isEndorsed={isEndorsed}
          problemNum={problemNum}
          endorsedNotByUser={endorsedNotByUser}
        />
      )}
      {userOwnsProblem && (
        <Link href={`/learn/problems/${problemNum}/edit`}>
          <Button size="sm" className="gap-1">
            <span>Edit</span>
            <EditIcon />
          </Button>
        </Link>
      )}
    </div>
  );
}
