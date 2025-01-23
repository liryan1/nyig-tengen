import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeHtml(input: string): string {
  // Use a regular expression to remove all HTML tags.
  const sanitized = input.replace(/<\/?[^>]+(>|$)/g, "");
  return sanitized.trim(); // Trim whitespace for clean output.
}
