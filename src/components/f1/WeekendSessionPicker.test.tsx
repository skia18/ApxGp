import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { WeekendSession } from "@/api/client";
import { WeekendSessionPicker } from "./WeekendSessionPicker";

const sessions: WeekendSession[] = [
  {
    sessionKey: 1,
    meetingKey: 10,
    type: "practice",
    name: "Practice 1",
    startsAt: "2026-11-06T14:30:00Z",
    endsAt: "2026-11-06T15:30:00Z",
    isCancelled: false,
  },
  {
    sessionKey: 2,
    meetingKey: 10,
    type: "sprint qualifying",
    name: "Sprint Qualifying",
    startsAt: "2026-11-06T18:30:00Z",
    endsAt: "2026-11-06T19:15:00Z",
    isCancelled: false,
  },
  {
    sessionKey: 3,
    meetingKey: 10,
    type: "sprint",
    name: "Sprint",
    startsAt: "2026-11-07T15:00:00Z",
    endsAt: "2026-11-07T16:00:00Z",
    isCancelled: false,
  },
  {
    sessionKey: 4,
    meetingKey: 10,
    type: "qualifying",
    name: "Qualifying",
    startsAt: "2026-11-07T19:00:00Z",
    endsAt: "2026-11-07T20:00:00Z",
    isCancelled: false,
  },
  {
    sessionKey: 5,
    meetingKey: 10,
    type: "race",
    name: "Race",
    startsAt: "2026-11-08T17:00:00Z",
    endsAt: "2026-11-08T19:00:00Z",
    isCancelled: false,
  },
];

describe("WeekendSessionPicker", () => {
  it("renders every provider session in a Sprint weekend", () => {
    render(
      <WeekendSessionPicker
        sessions={sessions}
        selectedKey={5}
        onSelect={() => undefined}
      />,
    );

    expect(screen.getByText("Practice 1")).toBeInTheDocument();
    expect(screen.getByText("Sprint Qualifying")).toBeInTheDocument();
    expect(screen.getByText("Sprint")).toBeInTheDocument();
    expect(screen.getByText("Qualifying")).toBeInTheDocument();
    expect(screen.getByText("Race")).toBeInTheDocument();
  });

  it("selects the exact provider session key", () => {
    const onSelect = vi.fn();
    render(
      <WeekendSessionPicker
        sessions={sessions}
        selectedKey={5}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Sprint Qualifying/ }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
