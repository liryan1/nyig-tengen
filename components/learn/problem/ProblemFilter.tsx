"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DualRangeSlider } from "@/components/ui/slider";
import { getRank } from "@/lib/go/display";
import { ArrowUpDown, Star, Trash2 } from "lucide-react";
import {
  createParser,
  parseAsBoolean,
  parseAsInteger,
  useQueryState,
  useQueryStates,
  type Options,
} from "nuqs";
import { useCallback } from "react";
import { ProblemCreatorInput } from "./ProblemCreatorInput";
import { TeamFilter } from "../TeamFilter";

const parseRank = createParser({
  parse(queryValue) {
    const rank = parseAsInteger.parse(queryValue);
    const isValid = rank && rank >= -30 && rank <= 8;
    if (!isValid) return null;
    return rank;
  },
  serialize(value) {
    return parseAsInteger.serialize(value);
  },
});
const options: Options = { throttleMs: 800 };

export function ProblemFilter() {
  const [rankRange, setRankRange] = useQueryStates(
    {
      rank_min: parseRank.withDefault(-30),
      rank_max: parseRank.withDefault(8),
    },
    options,
  );
  const [creatorId, setCreatorId] = useQueryState("creatorId", {
    ...options,
    defaultValue: "",
  });
  const [sort, setSort] = useQueryState("sort", {
    ...options,
    defaultValue: "",
  });
  const [starred, setStarred] = useQueryState("starred", parseAsBoolean);
  const [team, setTeam] = useQueryState("team", {
    ...options,
    defaultValue: "public",
  });

  const clearFilters = useCallback(() => {
    setRankRange({ rank_min: -30, rank_max: 8 });
    setCreatorId(null);
    setSort(null);
    setStarred(false);
    setTeam(null);
  }, [setRankRange, setCreatorId, setSort, setStarred, setTeam]);

  return (
    <div className="flex flex-wrap gap-x-2 sm:gap-x-4 gap-y-2 justify-center">
      <div className="w-80">
        <DualRangeSlider
          className="mt-5 mb-2"
          labelPosition="top"
          label={(value) => (
            <span>{value !== undefined ? getRank(value) : ""}</span>
          )}
          defaultValue={Object.values(rankRange)}
          value={Object.values(rankRange)}
          onValueChange={(value) =>
            setRankRange({ rank_min: value[0], rank_max: value[1] })
          }
          min={-30}
          max={8}
          step={1}
        />
      </div>
      <ProblemCreatorInput value={creatorId} onSelect={setCreatorId} />
      <TeamFilter value={team} onValueChange={setTeam} />
      <div>
        <Select value={sort || ""} onValueChange={setSort}>
          <SelectTrigger className="w-36">
            <div className="flex items-center gap-1">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="likes">Likes</SelectItem>
            <SelectItem value="views">Views</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select
          value={starred?.toString() || ""}
          onValueChange={(value) => setStarred(value === "true")}
        >
          <SelectTrigger className="w-36">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Favorites" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Starred</SelectItem>
            <SelectItem value="false">None</SelectItem>
          </SelectContent>
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
