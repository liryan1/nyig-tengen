import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isBetterScore,
  getPeriodStart,
  getRandomProblems,
  CHALLEGE_ANSWER_LABEL,
} from "@/lib/challenge";
import { db } from "@/lib/db";
import { ChallengeLeaderboardPeriod, ChallengeAnswer } from "@prisma/client";

vi.mock("@/lib/db", () => ({
  db: {
    challengeProblem: {
      aggregateRaw: vi.fn(),
    },
  },
}));

describe("lib/challenge", () => {
  describe("isBetterScore", () => {
    const cases = [
      { new: [10, 5000], old: [5, 5000], expected: true, desc: "more correct" },
      {
        new: [5, 5000],
        old: [10, 5000],
        expected: false,
        desc: "fewer correct",
      },
      {
        new: [10, 4000],
        old: [10, 5000],
        expected: true,
        desc: "same correct, faster",
      },
      {
        new: [10, 6000],
        old: [10, 5000],
        expected: false,
        desc: "same correct, slower",
      },
      { new: [10, 5000], old: [10, 5000], expected: false, desc: "identical" },
      {
        new: [0, 100],
        old: [0, 200],
        expected: true,
        desc: "zero correct, faster",
      },
    ];

    it.each(cases)(
      "should return $expected when $desc",
      ({ new: [nc, nt], old: [oc, ot], expected }) => {
        expect(isBetterScore(nc, nt, oc, ot)).toBe(expected);
      },
    );
  });

  describe("getPeriodStart", () => {
    // 2026-05-17 is a Sunday
    const sunday = new Date("2026-05-17T12:00:00Z");
    const monday = new Date("2026-05-18T12:00:00Z");
    const firstOfYear = new Date("2026-01-01T12:00:00Z");

    it("handles DAY correctly", () => {
      const start = getPeriodStart(ChallengeLeaderboardPeriod.DAY, sunday);
      expect(start.getHours()).toBe(0);
      expect(start.getDate()).toBe(17);
    });

    it("handles WEEK correctly (Sunday should go to previous Monday)", () => {
      const start = getPeriodStart(ChallengeLeaderboardPeriod.WEEK, sunday);
      expect(start.getDay()).toBe(1); // Monday
      expect(start.getDate()).toBe(11); // May 11, 2026
    });

    it("handles WEEK correctly (Monday stays on same day)", () => {
      const start = getPeriodStart(ChallengeLeaderboardPeriod.WEEK, monday);
      expect(start.getDay()).toBe(1);
      expect(start.getDate()).toBe(18);
    });

    it("handles MONTH correctly", () => {
      const start = getPeriodStart(ChallengeLeaderboardPeriod.MONTH, sunday);
      expect(start.getDate()).toBe(1);
      expect(start.getMonth()).toBe(4); // May
    });

    it("handles YEAR correctly", () => {
      const start = getPeriodStart(ChallengeLeaderboardPeriod.YEAR, sunday);
      expect(start.getMonth()).toBe(0); // Jan
      expect(start.getDate()).toBe(1);
    });

    it("handles ALLTIME correctly", () => {
      const start = getPeriodStart(ChallengeLeaderboardPeriod.ALLTIME);
      expect(start.toISOString()).toBe("2000-01-01T00:00:00.000Z");
    });

    it("handles edge case: Jan 1st", () => {
      const startDay = getPeriodStart(
        ChallengeLeaderboardPeriod.DAY,
        firstOfYear,
      );
      const startMonth = getPeriodStart(
        ChallengeLeaderboardPeriod.MONTH,
        firstOfYear,
      );
      const startYear = getPeriodStart(
        ChallengeLeaderboardPeriod.YEAR,
        firstOfYear,
      );

      expect(startDay.toISOString()).toEqual(startMonth.toISOString());
      expect(startMonth.toISOString()).toEqual(startYear.toISOString());
    });
  });

  describe("getRandomProblems", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("correctly constructs MongoDB aggregation with exclusions", async () => {
      const mockProblem = {
        num: "P1",
        sgf: "(;)",
        correctAnswer: "ALIVE",
        difficulty: 1,
      };
      (db.challengeProblem.aggregateRaw as any).mockResolvedValue([
        mockProblem,
      ]);

      const excluded = ["E1", "E2"];
      await getRandomProblems(5, excluded);

      // Verify at least one call happened (there are 5 zones)
      expect(db.challengeProblem.aggregateRaw).toHaveBeenCalled();

      const calls = (db.challengeProblem.aggregateRaw as any).mock.calls;
      calls.forEach((call: any) => {
        const pipeline = call[0].pipeline;
        const matchStage = pipeline.find((s: any) => s.$match)?.$match;
        if (matchStage) {
          expect(matchStage.num).toEqual({ $nin: excluded });
        }
      });
    });

    it("shuffles and limits results", async () => {
      const mockProblems = Array.from({ length: 50 }, (_, i) => ({
        num: `${i}`,
        sgf: "(;)",
        correctAnswer: "ALIVE",
        difficulty: (i % 5) + 1,
      }));

      (db.challengeProblem.aggregateRaw as any).mockImplementation(
        ({ pipeline }: any) => {
          const match = pipeline.find((s: any) => s.$match)?.$match;
          const size = pipeline.find((s: any) => s.$sample)?.$sample?.size || 1;
          const difficulty = match?.difficulty;
          return mockProblems
            .filter((p) => p.difficulty === difficulty)
            .slice(0, size);
        },
      );

      const count = 10;
      const result = await getRandomProblems(count);
      expect(result.length).toBe(count);
    });

    it("throws when no problems are found", async () => {
      (db.challengeProblem.aggregateRaw as any).mockResolvedValue([]);
      await expect(getRandomProblems()).rejects.toThrow(
        "No challenge problems available",
      );
    });
  });

  describe("CHALLEGE_ANSWER_LABEL", () => {
    it("matches expected labels", () => {
      expect(CHALLEGE_ANSWER_LABEL).toEqual({
        [ChallengeAnswer.DEAD]: "Dead",
        [ChallengeAnswer.UNSETTLED]: "Unsettled",
        [ChallengeAnswer.ALIVE]: "Alive",
      });
    });
  });
});
