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
  return <ProblemList problems={response.problems} />;
}

export default AllProblems;
