// app/problems/page.tsx
import { PageError } from "@/components/labels/Error";
import { ProblemList } from "@/components/learn/problem/ProblemList";
import { CustomPagination } from "@/components/nav/CustomPagination";
import { fetchSafe } from "@/lib/fetch";
import { GetProblemsResponse } from "@/lib/rtk/slices/problems";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function AllProblems({ searchParams }: PageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 20;

  const { response, isError } = await fetchSafe<GetProblemsResponse>(
    `/problems?page=${currentPage}&limit=${limit}`,
  );

  if (isError || !response) {
    return <PageError>Error getting problems</PageError>;
  }

  return (
    <div className="px-1 sm:px-0">
      <ProblemList problems={response.problems} />
      <CustomPagination
        className="my-4"
        currentPage={response.currentPage}
        totalPages={response.totalPages}
      />
    </div>
  );
}

export default AllProblems;
