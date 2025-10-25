"use client";
import { StatefulPagination } from "@/components/nav/StatefulPagination";
import {
  useCreatePSetProgressMutation,
  useGetPSetsQuery,
} from "@/lib/rtk/slices/problemSets";
import { useSearchParams } from "next/navigation";
import { type Options, parseAsInteger, useQueryState } from "nuqs";
import { PageError } from "../../labels/Error";
import { ProblemSetCard } from "./ProblemSetCard";
import { ProblemSetCardSkeleton } from "@/components/loading/ProblemSetCardSkeleton";

const limit = 8;
const options: Options = { throttleMs: 800 };

interface ProblemSetListProps {
  /**
   * If true, ignores all query params and uses the fixed limit to fetch
   * useful for summary pages that don't need pagination
   */
  fixedLimit?: number;
}

export function ProblemSetList({ fixedLimit }: ProblemSetListProps) {
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
  const {
    data,
    isError: psetsError,
    isLoading: psetsLoading,
  } = useGetPSetsQuery(
    fixedLimit ? `limit=${fixedLimit}&page=1` : searchParams.toString(),
  );
  const [createPSetProgress, { isLoading: cLoading, isError: cError }] =
    useCreatePSetProgressMutation();
  const isLoading = psetsLoading || cLoading;
  const isError = psetsError || cError;

  return (
    <div className="space-y-2">
      {fixedLimit === undefined && (
        <StatefulPagination
          currentPage={currentPage}
          totalPages={data?.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {isError ? (
          <PageError>Error getting problem sets</PageError>
        ) : isLoading ? (
          Array.from({ length: limit / 2 }, (_, i) => i).map((i) => (
            <ProblemSetCardSkeleton key={i} />
          ))
        ) : (
          data?.problemSets?.map((pset) => (
            <ProblemSetCard
              key={pset.num}
              problemSet={pset}
              onCreatePSetProgress={createPSetProgress}
              psetCreateLoading={isLoading}
              psetCreateError={isError}
            />
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
    </div>
  );
}
