import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { RaceStatusBadge, SampleDataBadge } from "@/components/f1/RaceStatusBadge";
import { TimingTable } from "@/components/f1/TimingTable";
import { CircuitMap } from "@/components/f1/CircuitMap";
import {
  LapProgressionChart,
  StintPanel,
  PositionChangesPanel,
  StrategyNotes,
} from "@/components/f1/StrategyPanels";
import { PageTitle } from "@/components/f1/SectionHeading";
import { DriverIdentity } from "@/components/f1/Identity";
import { Countdown } from "@/components/f1/Countdown";
import {
  sampleTimingRows,
  sampleStrategy,
  sampleSession,
} from "@/data/timing";
import { circuitById } from "@/data/circuits";
import { driverById, drivers } from "@/data/drivers";
import type { SessionState } from "@/data/types";
import type { Classification, Driver, Race, Session } from "@/api/client";
import {
  classificationQuery,
  currentSeasonQuery,
  nextRaceQuery,
  raceSessionsQuery,
  seasonRacesQuery,
} from "@/api/queries";

export const Route = createFileRoute("/race-centre")({
  loader: async ({ context }) => {
    const currentSeason = await context.queryClient.ensureQueryData(currentSeasonQuery());
    const race = await context.queryClient.ensureQueryData(nextRaceQuery());
    await Promise.all([
      context.queryClient.ensureQueryData(seasonRacesQuery(currentSeason.year)),
      context.queryClient.ensureQueryData(raceSessionsQuery(race.id)),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Race Centre — Apex F1" },
      { name: "description", content: "Upcoming Grand Prix, session schedule, sample live timing leaderboard, circuit visualisation and strategy analysis." },
      { property: "og:title", content: "Race Centre — Apex F1" },
      { property: "og:description", content: "Schedule, timing, circuit and strategy for the next Grand Prix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RaceCentre,
});

const VIEWS = ["overview", "results", "timing", "circuit", "strategy"] as const;
type View = (typeof VIEWS)[number];

const VIEW_LABELS: Record<View, string> = {
  overview: "Event Overview",
  results: "Results",
  timing: "Live Timing",
  circuit: "Circuit",
  strategy: "Strategy & Analysis",
};

function RaceCentre() {
  const { data: currentSeason } = useSuspenseQuery(currentSeasonQuery());
  const { data: nextRace } = useSuspenseQuery(nextRaceQuery());
  const { data: calendar } = useSuspenseQuery(seasonRacesQuery(currentSeason.year));
  const [selectedRaceId, setSelectedRaceId] = useState(nextRace.id);
  const race = calendar.find((item) => item.id === selectedRaceId) ?? nextRace;
  const sessionsQuery = useQuery(raceSessionsQuery(race.id));
  const sessions = sessionsQuery.data ?? [];
  const resultSessions = sessions.filter((session) => session.type !== "practice");
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const selectedSession =
    resultSessions.find((session) => session.id === selectedSessionId) ??
    resultSessions.find((session) => session.type === "race") ??
    resultSessions[0];
  const classification = useQuery({
    ...classificationQuery(selectedSession?.id ?? ""),
    enabled: Boolean(selectedSession),
  });
  const circuit = circuitById(race.circuit.slug.replaceAll("_", "-"));
  const eventState = getEventState(race);
  const [view, setView] = useState<View>("overview");
  const [sessionState, setSessionState] = useState<SessionState>("live");
  const [selectedDriver, setSelectedDriver] = useState<string>(drivers[0]!.id);

  // Sample datasets are deterministic; memoise so table and panels agree.
  const timingRows = useMemo(() => sampleTimingRows(), []);
  const strategy = useMemo(() => sampleStrategy(), []);

  const selected = driverById(selectedDriver);
  const selectedStrategy = strategy.find((s) => s.driverId === selectedDriver);
  const teamMate = selected ? drivers.find((d) => d.teamId === selected.teamId && d.id !== selected.id) : undefined;
  const teamMateStrategy = teamMate ? strategy.find((s) => s.driverId === teamMate.id) : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle
          eyebrow={`Round ${race.round} · ${currentSeason.year}`}
          title={race.name}
          description={`${race.circuit.name} · ${race.circuit.locality}, ${race.circuit.country}${circuit ? ` · ${circuit.lengthKm} km · ${circuit.turns} turns` : ""}`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <RaceStatusBadge state={eventState} pulse={eventState === "live"} />
            <span className="tabular text-xs text-muted-foreground">
              {eventState === "finished"
                ? "Event completed"
                : eventState === "live"
                  ? "Race in progress"
                  : "Upcoming event"}
            </span>
          </div>
        </PageTitle>
        <div className="panel p-4">
          <p className="eyebrow text-[10px] text-muted-foreground">
            {eventState === "finished" ? "Race completed" : "Race start"}
          </p>
          {eventState === "upcoming" ? (
            <div className="mt-3">
              <Countdown targetIso={race.startsAt} size="sm" />
            </div>
          ) : (
            <p className="mt-3 tabular text-sm font-semibold">
              {new Date(race.startsAt).toLocaleString("en-GB", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="panel mt-6 flex flex-wrap items-center gap-3 p-4">
        <label htmlFor="race-selector" className="eyebrow text-[10px] text-muted-foreground">
          Grand Prix
        </label>
        <select
          id="race-selector"
          value={race.id}
          onChange={(event) => {
            setSelectedRaceId(event.target.value);
            setSelectedSessionId(undefined);
          }}
          className="min-w-64 rounded-sm border border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground"
        >
          {calendar.map((item) => (
            <option key={item.id} value={item.id}>
              Round {item.round} · {item.name}
            </option>
          ))}
        </select>
        <span className="tabular text-xs text-muted-foreground">
          {new Date(race.startsAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-1 overflow-x-auto border-b border-border" aria-label="Race Centre views">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest transition-colors ${
                view === v
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </nav>
        {view !== "overview" && view !== "results" && (
          <div className="flex items-center gap-3">
            <SampleDataBadge />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Preview state
            <select
              value={sessionState}
              onChange={(e) => setSessionState(e.target.value as SessionState)}
              className="rounded-sm border border-border bg-secondary px-2 py-1 text-xs text-foreground"
            >
              {sampleSession.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          </div>
        )}
      </div>

      {view === "timing" && sessionState === "unavailable" ? (
        <div className="panel mt-8 flex flex-col items-center justify-center p-16 text-center">
          <p className="headline text-xl">Feed unavailable</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            No timing feed is connected for this session yet. Views are shown with clearly labelled sample data once a feed is integrated.
          </p>
        </div>
      ) : view === "timing" && sessionState === "delayed" ? (
        <div className="panel mt-4 border-l-2 border-signal-amber p-3 text-xs text-signal-amber">
          Timing data is delayed — positions and gaps shown are not real-time.
        </div>
      ) : null}

      {view === "overview" && (
        <Overview
          race={race}
          sessions={sessions}
          sessionsPending={sessionsQuery.isPending}
          sessionsError={sessionsQuery.error}
        />
      )}
      {view === "results" && (
        <ResultsView
          sessions={resultSessions}
          selectedSession={selectedSession}
          onSelectSession={setSelectedSessionId}
          sessionsPending={sessionsQuery.isPending}
          sessionsError={sessionsQuery.error}
          classification={classification.data}
          classificationPending={classification.isPending && Boolean(selectedSession)}
          classificationError={classification.error}
        />
      )}
      {view === "timing" && sessionState !== "unavailable" && (
        <section className="mt-6 space-y-4">
          {sessionState === "upcoming" && (
            <div className="panel p-10 text-center">
              <p className="headline text-xl">Session not started</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The leaderboard appears here when the session goes live. Preview with the sample dataset below.
              </p>
            </div>
          )}
          <div className="panel">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <p className="headline text-sm">Timing tower</p>
              <p className="text-xs text-muted-foreground">
                Sample dataset · click a row to follow that driver across timing, circuit and strategy
              </p>
            </div>
            <TimingTable
              rows={timingRows}
              selectedDriverId={selectedDriver}
              onSelect={setSelectedDriver}
            />
          </div>
          {selected && (
            <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm">
                Following <DriverIdentity driverId={selected.id} showNumber />
              </p>
              <p className="tabular text-xs text-muted-foreground">
                {selectedStrategy ? `${selectedStrategy.stints.length} stints · last pit lap ${selectedStrategy.pitLaps.join(", ")}` : ""}
              </p>
            </div>
          )}
        </section>
      )}
      {view === "circuit" && circuit && (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="panel p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="headline text-sm">{circuit.name}</p>
              <SampleDataBadge />
            </div>
            <CircuitMap circuit={circuit} className="mx-auto mt-4 max-w-lg" />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Stylised outline with sector thirds and turn markers. Driver position markers appear when positional telemetry is integrated — none are fabricated.
            </p>
          </div>
          <div className="space-y-4">
            <div className="panel p-5">
              <h3 className="headline text-sm">Circuit facts</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Fact label="Length" value={`${circuit.lengthKm} km`} />
                <Fact label="Turns" value={String(circuit.turns)} />
                <Fact label="First Grand Prix" value={String(circuit.firstGrandPrix)} />
                <Fact label="Lap record" value={circuit.lapRecord} />
              </dl>
            </div>
            {selected && (
              <div className="panel p-5">
                <h3 className="headline text-sm">Following</h3>
                <div className="mt-3">
                  <DriverIdentity driverId={selected.id} size="lg" showNumber />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Position markers will highlight this driver once live telemetry is connected.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
      {view === "circuit" && !circuit && (
        <StatusPanel
          title="Circuit visualisation unavailable"
          message={`A track illustration for ${race.circuit.name} has not been added yet.`}
        />
      )}
      {view === "strategy" && selectedStrategy && (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <label className="flex items-center gap-3 text-xs text-muted-foreground">
                Analyse driver
                <select
                  value={selectedDriver}
                  onChange={(event) => setSelectedDriver(event.target.value)}
                  className="rounded-sm border border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground"
                >
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </label>
              <SampleDataBadge />
            </div>
            <LapProgressionChart
              selected={selectedDriver}
              primary={selectedStrategy}
              {...(teamMateStrategy ? { secondary: teamMateStrategy } : {})}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <StintPanel strategy={selectedStrategy} />
              <PositionChangesPanel strategy={selectedStrategy} />
            </div>
          </div>
          <StrategyNotes />
        </section>
      )}

      <section className="mt-16">
        <h2 className="headline text-xl">{currentSeason.year} calendar</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {calendar.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelectedRaceId(r.id);
                  setSelectedSessionId(undefined);
                  setView("results");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`panel flex items-center justify-between p-4 text-left transition-colors hover:border-muted-foreground/50 ${
                  r.id === race.id ? "border-primary" : ""
                }`}
              >
                <div>
                  <p className="tabular text-[10px] text-muted-foreground">R{r.round}</p>
                  <p className="mt-1 text-sm font-semibold">{r.name}</p>
                  <p className="tabular mt-1 text-xs text-muted-foreground">
                    {new Date(r.startsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <RaceStatusBadge
                  state={getEventState(r)}
                  pulse={getEventState(r) === "live"}
                />
              </button>
            ))}
        </div>
      </section>
    </div>
  );
}

function Overview({
  race,
  sessions,
  sessionsPending,
  sessionsError,
}: {
  race: Race;
  sessions: Session[];
  sessionsPending: boolean;
  sessionsError: Error | null;
}) {
  const circuit = circuitById(race.circuit.slug.replaceAll("_", "-"));
  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-3">
      <div className="panel p-5 lg:col-span-2">
        <h3 className="headline text-sm">Weekend schedule</h3>
        <div className="mt-4 divide-y divide-border">
          {sessionsPending && (
            <p className="py-5 text-sm text-muted-foreground">Loading session schedule…</p>
          )}
          {sessionsError && (
            <p className="py-5 text-sm text-primary">{sessionsError.message}</p>
          )}
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <RaceStatusBadge
                  state={getSessionState(session, race)}
                  pulse={getSessionState(session, race) === "live"}
                />
                <span className="text-sm font-semibold">{session.name}</span>
              </div>
              <span className="tabular text-xs text-muted-foreground">
                {session.startsAt
                  ? new Date(session.startsAt).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                  : "TBC"}
              </span>
            </div>
          ))}
          {!sessionsPending && !sessionsError && sessions.length === 0 && (
            <p className="py-5 text-sm text-muted-foreground">
              Session schedule has not been published by the data provider yet.
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="panel p-5">
          <h3 className="headline text-sm">Circuit</h3>
          {circuit ? (
            <div className="mt-3">
              <CircuitMap circuit={circuit} className="max-w-[220px]" />
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Circuit illustration coming soon.
            </p>
          )}
          <Link to="/race-centre" className="mt-3 inline-block text-xs font-semibold text-primary">
            Circuit view →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ResultsView({
  sessions,
  selectedSession,
  onSelectSession,
  sessionsPending,
  sessionsError,
  classification,
  classificationPending,
  classificationError,
}: {
  sessions: Session[];
  selectedSession: Session | undefined;
  onSelectSession: (sessionId: string) => void;
  sessionsPending: boolean;
  sessionsError: Error | null;
  classification: Classification | undefined;
  classificationPending: boolean;
  classificationError: Error | null;
}) {
  if (sessionsPending) {
    return <StatusPanel title="Loading results" message="Fetching the available sessions…" />;
  }

  if (sessionsError) {
    return <StatusPanel title="Results unavailable" message={sessionsError.message} tone="error" />;
  }

  if (!selectedSession) {
    return (
      <StatusPanel
        title="No results yet"
        message="No qualifying or race sessions have been imported for this Grand Prix."
      />
    );
  }

  return (
    <section className="mt-6 space-y-4">
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <label htmlFor="session-selector" className="eyebrow text-[10px] text-muted-foreground">
          Session
        </label>
        <select
          id="session-selector"
          value={selectedSession.id}
          onChange={(event) => onSelectSession(event.target.value)}
          className="min-w-56 rounded-sm border border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground"
        >
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">Official imported classification</span>
      </div>

      {classificationPending && (
        <StatusPanel title="Loading classification" message="Fetching official results…" />
      )}
      {classificationError && (
        <StatusPanel
          title="Classification unavailable"
          message={classificationError.message}
          tone="error"
        />
      )}
      {classification && <ClassificationTable classification={classification} />}
    </section>
  );
}

function ClassificationTable({ classification }: { classification: Classification }) {
  const raceRows = classification.race ?? [];
  const qualifyingRows = classification.qualifying ?? [];

  if (raceRows.length === 0 && qualifyingRows.length === 0) {
    return (
      <StatusPanel
        title="No classification available"
        message="The session exists, but its classification has not been imported yet."
      />
    );
  }

  return (
    <div className="panel overflow-x-auto">
      <div className="border-b border-border px-5 py-4">
        <h2 className="headline text-base">{classification.session.name}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {raceRows.length || qualifyingRows.length} classified drivers
        </p>
      </div>
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Pos</th>
            <th className="px-4 py-3 font-semibold">Driver</th>
            <th className="px-4 py-3 font-semibold">Constructor</th>
            {raceRows.length > 0 ? (
              <>
                <th className="px-4 py-3 text-right font-semibold">Grid</th>
                <th className="px-4 py-3 text-right font-semibold">Laps</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Points</th>
              </>
            ) : (
              <>
                <th className="px-4 py-3 text-right font-semibold">Q1</th>
                <th className="px-4 py-3 text-right font-semibold">Q2</th>
                <th className="px-4 py-3 text-right font-semibold">Q3</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {raceRows.map((row) => (
            <tr key={row.driver.id} className="border-b border-border/50 last:border-0">
              <td className="px-4 py-3 tabular text-sm font-bold">{row.positionText}</td>
              <DriverCells driver={row.driver} constructorName={row.constructor.name} />
              <td className="px-4 py-3 text-right tabular text-sm text-muted-foreground">
                {row.grid || "Pit"}
              </td>
              <td className="px-4 py-3 text-right tabular text-sm">{row.laps}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{row.status}</td>
              <td className="px-4 py-3 text-right tabular text-sm font-semibold">{row.points}</td>
            </tr>
          ))}
          {qualifyingRows.map((row) => (
            <tr key={row.driver.id} className="border-b border-border/50 last:border-0">
              <td className="px-4 py-3 tabular text-sm font-bold">{row.position}</td>
              <DriverCells driver={row.driver} constructorName={row.constructor.name} />
              <td className="px-4 py-3 text-right tabular text-sm">{row.q1 ?? "—"}</td>
              <td className="px-4 py-3 text-right tabular text-sm">{row.q2 ?? "—"}</td>
              <td className="px-4 py-3 text-right tabular text-sm">{row.q3 ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DriverCells({
  driver,
  constructorName,
}: {
  driver: Driver;
  constructorName: string;
}) {
  return (
    <>
      <td className="px-4 py-3">
        <span className="text-sm font-semibold">
          {driver.givenName} {driver.familyName}
        </span>
        {driver.code && (
          <span className="ml-2 text-xs text-muted-foreground">{driver.code}</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{constructorName}</td>
    </>
  );
}

function StatusPanel({
  title,
  message,
  tone = "neutral",
}: {
  title: string;
  message: string;
  tone?: "neutral" | "error";
}) {
  return (
    <div className="panel mt-6 p-10 text-center">
      <p className={`headline text-lg ${tone === "error" ? "text-primary" : ""}`}>{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-xs font-semibold">{value}</dd>
    </div>
  );
}

function getEventState(race: Race): SessionState {
  const startsAt = new Date(race.startsAt).getTime();
  const now = Date.now();
  if (now < startsAt) return "upcoming";
  if (now <= startsAt + 4 * 3600_000) return "live";
  return "finished";
}

function getSessionState(session: Session, race: Race): SessionState {
  if (!session.startsAt) {
    const eventState = getEventState(race);
    if (eventState === "finished") return "finished";
    return session.type === "race" ? eventState : "upcoming";
  }

  const startsAt = new Date(session.startsAt).getTime();
  const now = Date.now();
  if (now < startsAt) return "upcoming";
  if (now <= startsAt + 3 * 3600_000) return "live";
  return "finished";
}
