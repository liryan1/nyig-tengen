"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getVisiblePages } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export function QueryPagination({
  currentPage,
  totalPages,
  className,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? createPageURL(currentPage - 1) : "#"}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {getVisiblePages(currentPage, totalPages).map((pageNumber, idx) => (
          <PaginationItem key={idx}>
            {pageNumber === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={createPageURL(pageNumber as number)}
                isActive={currentPage === pageNumber}
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={
              currentPage < totalPages ? createPageURL(currentPage + 1) : "#"
            }
            className={
              currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
