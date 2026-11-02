import type { WeekendSession } from "@/api/client";
import { RaceStatusBadge } from "@/components/f1/RaceStatusBadge";
import { getWeekendSessionState } from "@/lib/weekend";

export function WeekendSessionPicker({
  sessions,
  selectedKey,
  onSelect,
}: {
  sessions: WeekendSession[];
  selectedKey: number | undefined;
  onSelect: (sessionKey: number) => void;
}) {
  return (
    <div className="panel flex flex-wrap gap-2 p-3">
      {sessions.map((session) => {
        const state = getWeekendSessionState(session);
        return (
          <button
            key={session.sessionKey}
            type="button"
            onClick={() => onSelect(session.sessionKey)}
            className={`flex min-w-36 items-center justify-between gap-3 rounded-sm border px-3 py-2 text-left ${selectedKey === session.sessionKey ? "border-primary bg-secondary" : "border-border hover:border-muted-foreground/50"}`}
          >
            <span>
              <span className="block text-xs font-semibold">
                {session.name}
              </span>
              <span className="mt-0.5 block tabular text-[10px] text-muted-foreground">
                {new Date(session.startsAt).toLocaleString("en-GB", {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </span>
            <RaceStatusBadge state={state} pulse={state === "live"} />
          </button>
        );
      })}
    </div>
  );
}
