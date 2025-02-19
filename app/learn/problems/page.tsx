import { PageError } from "@/components/labels/Error";
import { ProblemList } from "@/components/learn/problem/ProblemList";
import { fetchSafe } from "@/lib/fetch";
import { GetProblemsResponse } from "@/lib/rtk/slices/problems";

async function AllProblems() {
  const { response, isError } =
    await fetchSafe<GetProblemsResponse>("/problems");
  if (isError || !response) {
    return <PageError>Error getting problems</PageError>;
  }
  return (
    <div className="px-1 sm:px-0">
      <ProblemList problems={response.problems} />
    </div>
  );
}

export default AllProblems;
