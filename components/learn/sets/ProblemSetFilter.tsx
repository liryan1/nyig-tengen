"use client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useQueryState, type Options } from "nuqs";
import { useCallback } from "react";
import { TeamFilter } from "../TeamFilter";

const options: Options = { throttleMs: 800 };

export function ProblemSetFilter() {
  const [team, setTeam] = useQueryState("team", {
    ...options,
    defaultValue: "public",
  });

  const clearFilters = useCallback(() => {
    setTeam(null);
  }, [setTeam]);

  return (
    <div className="flex flex-wrap gap-x-2 sm:gap-x-4 gap-y-2 justify-center">
      <TeamFilter value={team} onValueChange={setTeam} />
      <Button
        className="px-2 text-red-500"
        variant="outline"
        onClick={clearFilters}
      >
        Clear
        <Trash2 />
      </Button>
    </div>
  );
}
