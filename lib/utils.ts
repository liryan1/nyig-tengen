import { clsx, type ClassValue } from "clsx";
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
