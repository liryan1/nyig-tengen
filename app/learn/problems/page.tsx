import { PageError } from "@/components/labels/Error";
import { ProblemFilter } from "@/components/learn/problem/ProblemFilter";
import { ProblemList } from "@/components/learn/problem/ProblemList";
import { QueryPagination } from "@/components/nav/QueryPagination";
import { fetchSafe } from "@/lib/fetch";
import { ALL_PROBLEMS_TAG } from "@/lib/nextTags";
import { GetProblemsResponse } from "@/lib/rtk/slices/problems";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function AllProblemsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const limit = 20;

  const queryString = new URLSearchParams({
    ...params,
    page: currentPage.toString(),
    limit: limit.toString(),
  }).toString();

  const { response, isError } = await fetchSafe<GetProblemsResponse>(
    `/problems?${queryString}`,
    { next: { tags: [ALL_PROBLEMS_TAG] } },
    true,
  );

  if (isError || !response) {
    return <PageError>Error getting problems</PageError>;
  }

  return (
    <div className="px-1 sm:px-0">
      <ProblemList
        problems={response.problems ?? []}
        problemFilter={<ProblemFilter />}
        pagination={
          <QueryPagination
            currentPage={response.currentPage}
            totalPages={response.totalPages}
          />
        }
      />
    </div>
  );
}

export default AllProblemsPage;
