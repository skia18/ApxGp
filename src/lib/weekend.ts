import type { WeekendSession } from "@/api/client";
import type { SessionState } from "@/data/types";

export function getWeekendSessionState(
  session: WeekendSession,
  now = Date.now(),
): SessionState {
  if (session.isCancelled) return "unavailable";
  if (now < new Date(session.startsAt).getTime()) return "upcoming";
  if (now <= new Date(session.endsAt).getTime()) return "live";
  return "finished";
}

export function selectWeekendSession(
  sessions: WeekendSession[],
  selectedKey?: number,
): WeekendSession | undefined {
  return (
    sessions.find((session) => session.sessionKey === selectedKey) ??
    sessions.find((session) => session.type === "race") ??
    sessions.at(-1)
  );
}
