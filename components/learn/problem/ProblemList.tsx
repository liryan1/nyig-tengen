"use client";
import { StatefulPagination } from "@/components/nav/StatefulPagination";
import { useGetProblemsQuery } from "@/lib/rtk/slices/problems";
import { type Options, parseAsInteger, useQueryState } from "nuqs";
import { PageError } from "../../labels/Error";
import ProblemCard from "./ProblemCard";
import { useSearchParams } from "next/navigation";
import ProblemCardSkeleton from "@/components/loading/ProblemCardSkeleton";

const options: Options = { throttleMs: 800 };
const limit = 20;

const appendLimit = (qs: string) => {
  return [`limit=${limit}`, ...(qs.length ? [qs] : [])].join("&");
};

interface ProblemListProps {
  filter?: React.ReactNode;
  /**
   * If true, ignores all query params and uses the fixed limit to fetch
   * useful for summary pages that don't need pagination
   */
  fixedLimit?: number;
}

export function ProblemList({ filter, fixedLimit }: ProblemListProps) {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useQueryState("page", {
    ...options,
    defaultValue: 1,
    parse: (value) => {
      const parsed = parseAsInteger.parse(value);
      return parsed !== null ? parsed : 1;
    },
    serialize: (value) => value.toString(),
  });

  const { data, isError, isLoading } = useGetProblemsQuery(
    appendLimit(searchParams.toString()),
  );

  return (
    <>
      {filter}
      {fixedLimit === undefined && (
        <StatefulPagination
          currentPage={currentPage}
          totalPages={data?.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isError ? (
          <PageError>Error getting problems</PageError>
        ) : isLoading ? (
          Array.from({ length: limit / 2 }, (_, i) => i).map((i) => (
            <ProblemCardSkeleton key={i} />
          ))
        ) : (
          data?.problems?.map((problem) => (
            <ProblemCard key={problem.num} goProblemResponse={problem} />
          ))
        )}
      </div>
      {fixedLimit === undefined && (
        <StatefulPagination
          currentPage={currentPage}
          totalPages={data?.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}
