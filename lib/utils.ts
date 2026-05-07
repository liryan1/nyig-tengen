import { clsx, type ClassValue } from "clsx";
import { Session } from "next-auth";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeHtml(input: string): string {
  // Use a regular expression to remove all HTML tags.
  const sanitized = input.replace(/<\/?[^>]+(>|$)/g, "");
  return sanitized.trim(); // Trim whitespace for clean output.
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
