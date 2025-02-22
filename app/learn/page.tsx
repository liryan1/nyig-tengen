import { ProblemList } from "@/components/learn/problem/ProblemList";
import { ProblemSetList } from "@/components/learn/sets/ProblemSetList";
import { fetchSafe } from "@/lib/fetch";
import { GetProblemsResponse } from "@/lib/rtk/slices/problems";
import { GetPSetsResponse } from "@/lib/rtk/slices/problemSets";

export default async function ProblemsPage() {
  const [
    { response: resP, isError: isErrorP },
    { response: resPS, isError: isErrorPS },
  ] = await Promise.all([
    fetchSafe<GetProblemsResponse>("problems?page=1&limit=20"),
    fetchSafe<GetPSetsResponse>("problems/sets?page=1&limit=4"),
  ]);
  return (
    <div className="px-1 sm:px-0 space-y-12">
      <ProblemSetList
        problemSets={resPS?.problemSets ?? []}
        isError={isErrorPS}
        showMoreButton
      />
      <ProblemList
        problems={resP?.problems ?? []}
        isError={isErrorP}
        showMoreButton
      />
    </div>
  );
}
