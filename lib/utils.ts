import { clsx, type ClassValue } from "clsx";
import { Session } from "next-auth";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function ordinal(n: number) {
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

export function formatDuration(msInput: number) {
  const totalSec = Math.floor(msInput / 1000);
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const totalH = Math.floor(totalMin / 60);
  const h = totalH % 24;
  const d = Math.floor(totalH / 24);
  const s = totalSec % 60;

  const parts: string[] = [];
  if (d > 0) parts.push(`${d} days`);
  if (h > 0) parts.push(`${h} hours`);
  if (m > 0) parts.push(`${m} mins`);
  if (parts.length === 0) parts.push(`${s} seconds`);

  return parts.join(" ");
}

export function getVisiblePages(currentPage: number, totalPages: number) {
  const delta = 2;
  const range = [];
  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    range.unshift("...");
  }
  if (currentPage + delta < totalPages - 1) {
    range.push("...");
  }

  range.unshift(1);
  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
}

export function formatLargeNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 10000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return (num / 1000).toFixed(0) + "k";
}

export const truncateString = (str: string, maxLength: number = 15) => {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + "...";
};

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";

  const units = [
    { name: "year", seconds: 31536000 },
    { name: "month", seconds: 2592000 },
    { name: "day", seconds: 86400 },
    { name: "hour", seconds: 3600 },
    { name: "minute", seconds: 60 },
  ];

  for (const unit of units) {
    const interval = Math.floor(diffInSeconds / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.name}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return date.toLocaleDateString();
}

// Generic debounce method
// https://www.joshwcomeau.com/snippets/javascript/debounce/
export const debounce = (fn: Function, ms: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const isUserAdmin = (session?: Session | null) => {
  return (
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN"
  );
};
