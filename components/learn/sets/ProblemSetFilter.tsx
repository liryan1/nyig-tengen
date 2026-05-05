"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetMyTeamsQuery } from "@/lib/rtk/slices/teams";
import { Trash2, UsersIcon } from "lucide-react";
import { useQueryState, type Options } from "nuqs";
import { useCallback, useMemo } from "react";

const options: Options = { throttleMs: 800 };

export function ProblemSetFilter() {
  const { data: myTeams } = useGetMyTeamsQuery();

  const [team, setTeam] = useQueryState("team", {
    ...options,
    defaultValue: "public",
  });

  const clearFilters = useCallback(() => {
    setTeam(null);
  }, [setTeam]);

  const teamOptions = useMemo(() => {
    const teams = (myTeams || []).map((t) => (
      <SelectItem key={t.slug} value={t.slug}>
        {t.name}
      </SelectItem>
    ));
    return [
      <SelectItem key="public" value="public">
        Public
      </SelectItem>,
      ...teams,
    ];
  }, [myTeams]);

  return (
    <div className="flex flex-wrap gap-x-2 sm:gap-x-4 gap-y-2 justify-center">
      <div>
        <Select value={team || "public"} onValueChange={setTeam}>
          <SelectTrigger className="w-40">
            <div className="flex items-center gap-1">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Visibility" />
            </div>
          </SelectTrigger>
          <SelectContent>{teamOptions}</SelectContent>
        </Select>
      </div>
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
