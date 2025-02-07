import { PageError } from "@/components/labels/Error";
import { ProblemCard } from "@/components/learn/problem/ProblemCard";
import { fetchSafe } from "@/lib/fetch";
import { GetProblemsResponse } from "@/lib/rtk/slices/problems";

async function AllProblems() {
  const { response, isError } =
    await fetchSafe<GetProblemsResponse>("/problems");
  if (isError) {
    return <PageError>Error getting problems</PageError>;
  }
  return (
    <div>
      {response?.problems.map((p, i) => (
        <ProblemCard key={i} goProblemResponse={p} />
      ))}
    </div>
  );
}

export default AllProblems;
