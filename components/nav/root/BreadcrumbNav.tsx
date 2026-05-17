"use client";

import { HomeIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "../../ui/breadcrumb";
import { useGetPSetQuery } from "@/lib/rtk/slices/problemSets";
import { useGetTeamQuery } from "@/lib/rtk/slices/teams";

interface BreadcrumbNavProps {
  children?: React.ReactNode;
}

/**
 * Specialized label components
 */
const ProblemSetLabel = ({ segment }: { segment: string }) => {
  const { data } = useGetPSetQuery(segment);
  return <>{data?.name || segment}</>;
};

const TeamLabel = ({ segment }: { segment: string }) => {
  const { data } = useGetTeamQuery(segment);
  return <>{data?.name || segment}</>;
};

const ProblemLabel = ({ segment }: { segment: string }) => (
  <>Problem {segment}</>
);

/**
 * Resolver configuration: maps a preceding segment to a component that handles the current segment
 */
const labelResolvers: Record<string, React.FC<{ segment: string }>> = {
  sets: ProblemSetLabel,
  teams: TeamLabel,
  problems: ProblemLabel,
};

function CrumbLabel({
  segment,
  index,
  array,
}: {
  segment: string;
  index: number;
  array: string[];
}) {
  // 1. Check for specific keyword overrides
  const overrides: Record<string, string> = {
    new: "New",
    invites: "Invites",
    run: "Challenge",
  };
  if (overrides[segment]) return <>{overrides[segment]}</>;

  // 2. Check for contextual resolvers based on previous segment
  const prevSegment = index > 0 ? array[index - 1] : null;
  const Resolver = prevSegment ? labelResolvers[prevSegment] : null;
  if (Resolver) return <Resolver segment={segment} />;

  // 3. Special case for deep nesting: /learn/sets/[id]/[num]
  if (array.includes("sets") && !isNaN(Number(segment))) {
    return <ProblemLabel segment={segment} />;
  }

  // 4. Default: Capitalize
  return <>{segment.charAt(0).toUpperCase() + segment.slice(1)}</>;
}

export function BreadcrumbNav({ children }: BreadcrumbNavProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    return { segment, href };
  });

  const isLastIndex = (index: number) => index === breadcrumbs.length - 1;

  return (
    <Breadcrumb className="flex justify-between items-center">
      <BreadcrumbList className="text-[11px] sm:text-sm">
        <BreadcrumbItem className="hidden md:block hover:text-primary hover:underline">
          <BreadcrumbLink href="/">
            <HomeIcon size={16} />
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.length > 2 && (
          <BreadcrumbItem className="md:hidden">
            <BreadcrumbEllipsis className="h-4 w-4" />
          </BreadcrumbItem>
        )}

        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator
              className={
                index > breadcrumbs.length - 2
                  ? ""
                  : index === breadcrumbs.length - 2 && breadcrumbs.length > 2
                    ? ""
                    : "hidden md:block"
              }
            />
            <BreadcrumbItem
              className={
                index >= breadcrumbs.length - 2
                  ? isLastIndex(index)
                    ? ""
                    : "hover:text-primary hover:underline"
                  : "hidden md:block hover:text-primary hover:underline"
              }
            >
              {isLastIndex(index) ? (
                <BreadcrumbPage>
                  <CrumbLabel
                    segment={crumb.segment}
                    index={index}
                    array={segments}
                  />
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>
                  <CrumbLabel
                    segment={crumb.segment}
                    index={index}
                    array={segments}
                  />
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>

      {children}
    </Breadcrumb>
  );
}
