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
import { X } from "lucide-react";
import {
  createParser,
  parseAsInteger,
  useQueryState,
  useQueryStates,
  type Options,
} from "nuqs";
import { useCallback } from "react";
import { ProblemCreatorInput } from "./ProblemCreatorInput";

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
const options: Options = { shallow: false, throttleMs: 800 };

export function ProblemFilter() {
  const [rankRange, setRankRange] = useQueryStates(
    {
      rank_min: parseRank.withDefault(-30),
      rank_max: parseRank.withDefault(8),
    },
    options,
  );
  const [creator, setCreator] = useQueryState("creator", {
    ...options,
    defaultValue: "",
  });
  const [sort, setSort] = useQueryState("sort", {
    ...options,
    defaultValue: "",
  });

  const clearFilters = useCallback(() => {
    setRankRange({ rank_min: -30, rank_max: 8 });
    setCreator(null);
    setSort(null);
  }, [setRankRange, setCreator, setSort]);

  return (
    <div className="flex flex-wrap gap-x-4 mb-4">
      <div className="min-w-80 w-full max-w-[600px]">
        <DualRangeSlider
          className="mt-1 mb-6"
          labelPosition="bottom"
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
      <ProblemCreatorInput value={creator} onSelect={setCreator} />
      <div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="min-w-32 sm:min-w-36 h-8 sm:h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="likes">Likes</SelectItem>
            <SelectItem value="views">Views</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="h-8 sm:h-9" variant="secondary" onClick={clearFilters}>
        <X />
      </Button>
    </div>
  );
}
