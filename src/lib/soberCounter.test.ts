import { describe, it, expect } from "vitest";
import { computeSoberStatus, formatSoberDuration } from "./soberCounter";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Local wall-clock times, so calendar-day assertions don't depend on the
// machine's timezone.
const at = (isoLocal: string) => new Date(isoLocal);

describe("computeSoberStatus", () => {
  it("reports no data when nothing has ever been logged", () => {
    const status = computeSoberStatus([], at("2026-10-05T12:00:00"));
    expect(status).toEqual({
      lastAt: null,
      currentMs: null,
      longestMs: null,
      freeDays: 0,
      windowDays: 0,
    });
  });

  it("measures the current streak from the most recent session", () => {
    const status = computeSoberStatus(
      ["2026-10-01T09:00:00", "2026-10-03T10:00:00", "2026-10-02T09:00:00"],
      at("2026-10-05T12:00:00")
    );
    expect(status.lastAt).toEqual(at("2026-10-03T10:00:00"));
    expect(status.currentMs).toBe(2 * DAY + 2 * HOUR);
  });

  it("keeps the longest past gap after a slip resets the current streak", () => {
    const status = computeSoberStatus(
      ["2026-09-01T09:00:00", "2026-09-15T09:00:00", "2026-10-05T11:00:00"],
      at("2026-10-05T12:00:00")
    );
    expect(status.currentMs).toBe(HOUR);
    // 15 Sep → 5 Oct 11:00 is the longest gap.
    expect(status.longestMs).toBe(20 * DAY + 2 * HOUR);
  });

  it("counts the current streak as the longest when it is", () => {
    const status = computeSoberStatus(
      ["2026-09-01T09:00:00", "2026-09-02T09:00:00"],
      at("2026-10-05T09:00:00")
    );
    expect(status.longestMs).toBe(status.currentMs);
  });

  it("clamps a future-dated session to a zero current streak", () => {
    const status = computeSoberStatus(
      ["2026-10-06T09:00:00"],
      at("2026-10-05T12:00:00")
    );
    expect(status.currentMs).toBe(0);
    expect(status.longestMs).toBe(0);
  });

  it("counts session-free calendar days in the last 30, including today", () => {
    const status = computeSoberStatus(
      [
        "2026-08-01T09:00:00", // long before the window
        "2026-09-10T09:00:00",
        "2026-09-10T22:00:00", // same day — counts once
        "2026-10-04T23:30:00",
      ],
      at("2026-10-05T12:00:00")
    );
    expect(status.windowDays).toBe(30);
    expect(status.freeDays).toBe(28);
  });

  it("only counts days since logging started, so pre-app days aren't 'clean'", () => {
    const status = computeSoberStatus(
      ["2026-09-30T09:00:00", "2026-10-02T09:00:00"],
      at("2026-10-05T12:00:00")
    );
    // 30 Sep … 5 Oct is 6 days; two had sessions.
    expect(status.windowDays).toBe(6);
    expect(status.freeDays).toBe(4);
  });
});

describe("formatSoberDuration", () => {
  it.each([
    [0, "0m"],
    [35 * 60 * 1000, "35m"],
    [5 * HOUR + 12 * 60 * 1000, "5h 12m"],
    [3 * DAY + 4 * HOUR + 59 * 60 * 1000, "3d 4h"],
    [45 * DAY + 23 * HOUR, "45d"],
  ])("formats %d ms as %s", (ms, expected) => {
    expect(formatSoberDuration(ms)).toBe(expected);
  });
});
