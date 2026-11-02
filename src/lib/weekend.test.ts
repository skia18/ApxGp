import { describe, expect, it } from "vitest";
import type { WeekendSession } from "@/api/client";
import { selectWeekendSession } from "./weekend";

const session = (sessionKey: number, type: string): WeekendSession => ({
  sessionKey,
  meetingKey: 1,
  type,
  name: type,
  startsAt: "2026-11-01T10:00:00Z",
  endsAt: "2026-11-01T11:00:00Z",
  isCancelled: false,
});

describe("selectWeekendSession", () => {
  it("does not retain a session key that is absent from the new meeting", () => {
    const newMeeting = [session(21, "sprint"), session(22, "race")];

    expect(selectWeekendSession(newMeeting, 10)?.sessionKey).toBe(22);
  });

  it("selects Sprint sessions when explicitly requested", () => {
    const sprintWeekend = [
      session(21, "sprint qualifying"),
      session(22, "sprint"),
    ];

    expect(selectWeekendSession(sprintWeekend, 21)?.type).toBe(
      "sprint qualifying",
    );
  });
});
