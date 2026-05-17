import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatLargeNumber,
  formatRelativeTime,
  sanitizeHtml,
  truncateString,
} from "@/lib/utils";

describe("lib/utils", () => {
  describe("formatLargeNumber", () => {
    const cases = [
      { input: 0, expected: "0" },
      { input: 999, expected: "999" },
      { input: 1000, expected: "1k" },
      { input: 1200, expected: "1.2k" },
      { input: 1250, expected: "1.3k" }, // Rounds to 1.3
      { input: 9949, expected: "9.9k" },
      { input: 9950, expected: "9.9k" }, // JS toFixed(1) for 9.95 can be 9.9
      { input: 9999, expected: "10k" },
      { input: 10000, expected: "10k" },
      { input: 10499, expected: "10k" }, // toFixed(0) rounds down
      { input: 10500, expected: "11k" }, // toFixed(0) rounds up
      { input: 1000000, expected: "1000k" },
    ];

    it.each(cases)("formats $input as $expected", ({ input, expected }) => {
      expect(formatLargeNumber(input)).toBe(expected);
    });
  });

  describe("formatRelativeTime", () => {
    const NOW = new Date("2026-05-17T12:00:00Z");

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const cases = [
      {
        input: new Date(NOW.getTime() - 10 * 1000),
        expected: "just now",
        desc: "less than a minute",
      },
      {
        input: new Date(NOW.getTime() - 60 * 1000),
        expected: "1 minute ago",
        desc: "exactly one minute",
      },
      {
        input: new Date(NOW.getTime() - 5 * 60 * 1000),
        expected: "5 minutes ago",
        desc: "multiple minutes",
      },
      {
        input: new Date(NOW.getTime() - 60 * 60 * 1000),
        expected: "1 hour ago",
        desc: "exactly one hour",
      },
      {
        input: new Date(NOW.getTime() - 24 * 60 * 60 * 1000),
        expected: "1 day ago",
        desc: "exactly one day",
      },
      {
        input: new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000),
        expected: "1 month ago",
        desc: "roughly one month",
      },
      {
        input: new Date(NOW.getTime() - 365 * 24 * 60 * 60 * 1000),
        expected: "1 year ago",
        desc: "exactly one year",
      },
      {
        input: new Date(NOW.getTime() - 2 * 365 * 24 * 60 * 60 * 1000),
        expected: "2 years ago",
        desc: "multiple years",
      },
      {
        input: new Date(NOW.getTime() + 1000),
        expected: "just now",
        desc: "future date",
      },
    ];

    it.each(cases)("returns '$expected' for $desc", ({ input, expected }) => {
      expect(formatRelativeTime(input)).toBe(expected);
    });
  });

  describe("sanitizeHtml", () => {
    it("removes basic HTML tags", () => {
      expect(sanitizeHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
    });

    it("handles self-closing tags", () => {
      expect(sanitizeHtml("Hello<br/> world")).toBe("Hello world");
    });

    it("trims whitespace", () => {
      expect(sanitizeHtml("  <p>text</p>  ")).toBe("text");
    });
  });

  describe("truncateString", () => {
    it("does not truncate short strings", () => {
      expect(truncateString("hello", 10)).toBe("hello");
    });

    it("truncates long strings and adds ellipsis", () => {
      expect(truncateString("hello world", 5)).toBe("hello...");
    });

    it("uses default length of 15", () => {
      expect(truncateString("this is a very long string")).toBe(
        "this is a very ...",
      );
    });
  });
});
