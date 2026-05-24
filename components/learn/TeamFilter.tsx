"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetMyTeamsQuery } from "@/lib/rtk/slices/teams";
import { UsersIcon } from "lucide-react";
import { useMemo } from "react";

interface TeamFilterProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
}

export function TeamFilter({ value, onValueChange }: TeamFilterProps) {
  const { data: myTeams } = useGetMyTeamsQuery();

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
    <div>
      <Select
        value={value || "public"}
        onValueChange={(val) => onValueChange(val === "public" ? null : val)}
      >
        <SelectTrigger className="w-40">
          <div className="flex items-center gap-1">
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Visibility" />
          </div>
        </SelectTrigger>
        <SelectContent>{teamOptions}</SelectContent>
      </Select>
    </div>
  );
}
