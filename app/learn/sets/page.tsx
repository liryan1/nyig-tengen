import { PageError } from "@/components/labels/Error";
import { ProblemSetList } from "@/components/learn/sets/ProblemSetList";
import { QueryPagination } from "@/components/nav/QueryPagination";
import { fetchSafe } from "@/lib/fetch";
import { ALL_PROBLEM_SETS_TAG } from "@/lib/nextTags";
import { GetPSetsResponse } from "@/lib/rtk/slices/problemSets";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProblemSetsPage({ searchParams }: PageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 20;

  const { response, isError } = await fetchSafe<GetPSetsResponse>(
    `/problems/sets?page=${currentPage}&limit=${limit}`,
    { next: { tags: [ALL_PROBLEM_SETS_TAG] } },
    true,
  );

  if (isError || !response) {
    return <PageError>Error getting problems</PageError>;
  }

  return (
    <div className="flex flex-col gap-6">
      <ProblemSetList problemSets={response.problemSets} isError={isError} />
      <QueryPagination
        className="my-4"
        currentPage={response.currentPage}
        totalPages={response.totalPages}
      />
    </div>
  );
}
