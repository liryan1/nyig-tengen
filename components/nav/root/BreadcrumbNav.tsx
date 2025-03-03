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
} from "../../ui/breadcrumb";

interface BreadcrumbNavProps {
  children?: React.ReactNode;
}

export function BreadcrumbNav({ children }: BreadcrumbNavProps) {
  const pathname = usePathname();

  // Convert pathname to breadcrumb navigation
  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, array) => {
      const href = "/" + array.slice(0, index + 1).join("/");
      return { label: segment, href };
    });

  const isLastIndex = (index: number) => index === breadcrumbs.length - 1;

  return (
    <Breadcrumb className="flex justify-between items-center">
      <BreadcrumbList>
        <BreadcrumbItem className="hover:text-primary hover:underline">
          <BreadcrumbLink href="/">
            <HomeIcon size={16} />
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator
              className={isLastIndex(index) ? undefined : "hidden md:block"}
            />
            <BreadcrumbItem
              className={
                isLastIndex(index)
                  ? undefined
                  : "hidden md:block hover:text-primary hover:underline"
              }
            >
              {isLastIndex(index) ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>

      {children}
    </Breadcrumb>
  );
}
