import type { SessionState } from "@/data/types";

const STYLES: Record<SessionState, { label: string; dot: string; text: string }> = {
  upcoming: { label: "Upcoming", dot: "bg-signal-blue", text: "text-signal-blue" },
  live: { label: "Live", dot: "bg-signal-green", text: "text-signal-green" },
  suspended: { label: "Suspended", dot: "bg-signal-amber", text: "text-signal-amber" },
  finished: { label: "Finished", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  delayed: { label: "Delayed data", dot: "bg-signal-amber", text: "text-signal-amber" },
  unavailable: { label: "Feed unavailable", dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

export function RaceStatusBadge({
  state,
  pulse,
}: {
  state: SessionState;
  pulse?: boolean;
}) {
  const s = STYLES[state];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1">
      <span className="relative flex h-2 w-2">
        {pulse && (state === "live" || state === "suspended") && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${s.dot}`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
      </span>
      <span className={`text-[11px] font-semibold uppercase tracking-widest ${s.text}`}>
        {s.label}
      </span>
    </span>
  );
}

/** Small persistent marker that the data on this panel is sample content. */
export function SampleDataBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ${className}`}
    >
      Sample data
    </span>
  );
}
