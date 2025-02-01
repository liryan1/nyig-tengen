import { PageError } from "@/components/labels/Error";
import { ProblemSetCard } from "@/components/learn/sets/ProblemSetCard";
import { fetchSafe } from "@/lib/fetch";
import { GetPSetsResponse } from "@/lib/rtk/slices/problemSets";

export default async function ProblemSetsPage() {
  const { response, isError } =
    await fetchSafe<GetPSetsResponse>("/problems/sets");
  if (isError || !response) {
    return <PageError>Error getting problems</PageError>;
  }
  return (
    <div className="flex flex-col gap-6">
      {response.problemSets.map((pset, i) => (
        <ProblemSetCard key={i} problemSet={pset} />
      ))}
    </div>
  );
}
