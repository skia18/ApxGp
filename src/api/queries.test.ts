import { describe, expect, it } from "vitest";
import { liveWeekendQuery } from "./queries";

describe("liveWeekendQuery", () => {
  it("uses a distinct cache key for each selected Grand Prix", () => {
    const mexico = liveWeekendQuery("2026-11-01T20:00:00Z");
    const brazil = liveWeekendQuery("2026-11-08T17:00:00Z");

    expect(mexico.queryKey).toEqual(["live-weekend", "2026-11-01T20:00:00Z"]);
    expect(brazil.queryKey).toEqual(["live-weekend", "2026-11-08T17:00:00Z"]);
    expect(mexico.queryKey).not.toEqual(brazil.queryKey);
  });
});
