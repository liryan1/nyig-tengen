"use client";

import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbNavProps {
  children?: React.ReactNode;
}

function normalizeSegment(segment: string) {
  const n = 4;
  if (segment.length > 10) {
    return segment.slice(0, n) + ".." + segment.slice(segment.length - n);
  }
  return segment;
}

export function BreadcrumbNav({ children }: BreadcrumbNavProps) {
  const pathname = usePathname();

  // Convert pathname to breadcrumb navigation
  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, array) => {
      const href = "/" + array.slice(0, index + 1).join("/");
      return { label: normalizeSegment(segment), href };
    });

  return (
    <nav className="px-1 sm:px-6 py-2 flex justify-between items-center">
      <div className="flex items-center text-sm">
        <Link className="hover:underline" href="/">
          <HomeIcon size={16} />
        </Link>
        <div className="px-1">/</div>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center">
            {index === breadcrumbs.length - 1 ? (
              <div>{crumb.label}</div>
            ) : (
              <Link className="hover:underline" href={crumb.href}>
                {crumb.label}
              </Link>
            )}
            {index < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
          </div>
        ))}
      </div>

      {children}
    </nav>
  );
}
