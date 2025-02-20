import { ProblemList } from "@/components/learn/problem/ProblemList";
import { ProblemSetList } from "@/components/learn/sets/ProblemSetList";
import { fetchSafe } from "@/lib/fetch";
import { GetProblemsResponse } from "@/lib/rtk/slices/problems";
import { GetPSetsResponse } from "@/lib/rtk/slices/problemSets";

export default async function ProblemsPage() {
  const { response: resP, isError: isErrorP } =
    await fetchSafe<GetProblemsResponse>("problems");
  const { response: resPS, isError: isErrorPS } =
    await fetchSafe<GetPSetsResponse>("problems/sets");
  return (
    <div className="px-1 sm:px-0 space-y-6">
      <ProblemSetList
        problemSets={resPS?.problemSets ?? []}
        isError={isErrorPS}
      />
      <ProblemList problems={resP?.problems ?? []} isError={isErrorP} />
    </div>
  );
}
