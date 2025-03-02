import { ProblemList } from "@/components/learn/problem/ProblemList";
import { ProblemSetList } from "@/components/learn/sets/ProblemSetList";
import { fetchSafe } from "@/lib/fetch";
import { ALL_PROBLEM_SETS_TAG, ALL_PROBLEMS_TAG } from "@/lib/nextTags";
import { GetProblemsResponse } from "@/lib/rtk/slices/problems";
import { GetPSetsResponse } from "@/lib/rtk/slices/problemSets";

async function LearnPage() {
  const [
    { response: resP, isError: isErrorP },
    { response: resPS, isError: isErrorPS },
  ] = await Promise.all([
    fetchSafe<GetProblemsResponse>(
      "problems?page=1&limit=20",
      { next: { tags: [ALL_PROBLEMS_TAG] } },
      true,
    ),
    fetchSafe<GetPSetsResponse>(
      "problems/sets?page=1&limit=3",
      { next: { tags: [ALL_PROBLEM_SETS_TAG] } },
      true,
    ),
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

export default LearnPage;
