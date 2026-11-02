import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  RaceStatusBadge,
  SampleDataBadge,
} from "@/components/f1/RaceStatusBadge";
import { LiveTimingTable } from "@/components/f1/TimingTable";
import { CircuitMap } from "@/components/f1/CircuitMap";
import {
  LapProgressionChart,
  StintPanel,
  PaceSummaryPanel,
  StrategyNotes,
} from "@/components/f1/StrategyPanels";
import { PageTitle } from "@/components/f1/SectionHeading";
import { DriverIdentity } from "@/components/f1/Identity";
import { Countdown } from "@/components/f1/Countdown";
import { sampleSession } from "@/data/timing";
import { circuitById } from "@/data/circuits";
import { driverById, drivers } from "@/data/drivers";
import type { SessionState } from "@/data/types";
import type { Race, WeekendSession } from "@/api/client";
import {
  currentSeasonQuery,
  nextRaceQuery,
  seasonRacesQuery,
  liveTimingQuery,
  liveWeekendQuery,
  liveSessionTimingQuery,
  liveSessionStrategyQuery,
} from "@/api/queries";

export const Route = createFileRoute("/race-centre")({
  loader: async ({ context }) => {
    const currentSeason =
      await context.queryClient.ensureQueryData(currentSeasonQuery());
    const race = await context.queryClient.ensureQueryData(nextRaceQuery());
    await context.queryClient.ensureQueryData(
      seasonRacesQuery(currentSeason.year),
    );
  },
  head: () => ({
    meta: [
      { title: "Race Centre — Apex F1" },
      {
        name: "description",
        content:
          "Upcoming Grand Prix, OpenF1 timing leaderboard, session results, circuit visualisation and strategy analysis.",
      },
      { property: "og:title", content: "Race Centre — Apex F1" },
      {
        property: "og:description",
        content:
          "Schedule, timing, circuit and strategy for the next Grand Prix.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RaceCentre,
});

const VIEWS = ["timing", "circuit", "strategy"] as const;
type View = (typeof VIEWS)[number];

const VIEW_LABELS: Record<View, string> = {
  timing: "Weekend Timing",
  circuit: "Circuit",
  strategy: "Strategy & Analysis",
};

function RaceCentre() {
  const { data: currentSeason } = useSuspenseQuery(currentSeasonQuery());
  const { data: nextRace } = useSuspenseQuery(nextRaceQuery());
  const { data: calendar } = useSuspenseQuery(
    seasonRacesQuery(currentSeason.year),
  );
  const [selectedRaceId, setSelectedRaceId] = useState(nextRace.id);
  const race = calendar.find((item) => item.id === selectedRaceId) ?? nextRace;
  const circuit = circuitById(race.circuit.slug.replaceAll("_", "-"));
  const eventState = getEventState(race);
  const [view, setView] = useState<View>("timing");
  const weekend = useQuery(liveWeekendQuery());
  const [selectedWeekendKey, setSelectedWeekendKey] = useState<number>();
  const selectedWeekendSession =
    weekend.data?.sessions.find(
      (session) => session.sessionKey === selectedWeekendKey,
    ) ??
    weekend.data?.sessions.find((session) => session.type === "race") ??
    weekend.data?.sessions.at(-1);
  const selectedWeekendState = selectedWeekendSession
    ? getWeekendSessionState(selectedWeekendSession)
    : "unavailable";
  const liveTiming = useQuery({
    ...liveTimingQuery(),
    enabled: view === "timing" && selectedWeekendState === "live",
  });
  const historicalTiming = useQuery({
    ...liveSessionTimingQuery(selectedWeekendSession?.sessionKey ?? 0),
    enabled: view === "timing" && selectedWeekendState === "finished",
  });
  const [sessionState, setSessionState] = useState<SessionState>("live");
  const [selectedDriver, setSelectedDriver] = useState<string>(drivers[0]!.id);
  const [selectedStrategyDriver, setSelectedStrategyDriver] =
    useState<number>();
  const strategySession =
    selectedWeekendSession && selectedWeekendState !== "upcoming"
      ? selectedWeekendSession
      : weekend.data?.sessions
          .filter((session) => getWeekendSessionState(session) === "finished")
          .at(-1);
  const strategyQuery = useQuery({
    ...liveSessionStrategyQuery(strategySession?.sessionKey ?? 0),
    enabled: view === "strategy" && Boolean(strategySession),
  });
  const selectedStrategy =
    strategyQuery.data?.drivers.find(
      (driver) => driver.driverNumber === selectedStrategyDriver,
    ) ?? strategyQuery.data?.drivers[0];
  const teamMateStrategy = selectedStrategy
    ? strategyQuery.data?.drivers.find(
        (driver) =>
          driver.teamName === selectedStrategy.teamName &&
          driver.driverNumber !== selectedStrategy.driverNumber,
      )
    : undefined;
  const selected = driverById(selectedDriver);

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
                  ? Date.now() < new Date(race.startsAt).getTime()
                    ? "Race weekend live"
                    : "Race in progress"
                  : "Upcoming event"}
            </span>
          </div>
        </PageTitle>
        <div className="panel p-4">
          <p className="eyebrow text-[10px] text-muted-foreground">
            {eventState === "finished" ? "Race completed" : "Race start"}
          </p>
          {Date.now() < new Date(race.startsAt).getTime() ? (
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
        <label
          htmlFor="race-selector"
          className="eyebrow text-[10px] text-muted-foreground"
        >
          Grand Prix
        </label>
        <select
          id="race-selector"
          value={race.id}
          onChange={(event) => {
            setSelectedRaceId(event.target.value);
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
        <nav
          className="flex gap-1 overflow-x-auto border-b border-border"
          aria-label="Race Centre views"
        >
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
        {view === "circuit" && (
          <div className="flex items-center gap-3">
            <SampleDataBadge />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Preview state
              <select
                value={sessionState}
                onChange={(e) =>
                  setSessionState(e.target.value as SessionState)
                }
                className="rounded-sm border border-border bg-secondary px-2 py-1 text-xs text-foreground"
              >
                {sampleSession.states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      {view === "timing" && (
        <section className="mt-6 space-y-4">
          {weekend.isPending && (
            <StatusPanel
              title="Loading race weekend"
              message="Fetching the official session schedule…"
            />
          )}
          {weekend.error && (
            <StatusPanel
              title="Weekend schedule unavailable"
              message={weekend.error.message}
              tone="error"
            />
          )}
          {weekend.data && (
            <div className="panel flex flex-wrap gap-2 p-3">
              {weekend.data.sessions.map((session) => {
                const state = getWeekendSessionState(session);
                const active =
                  selectedWeekendSession?.sessionKey === session.sessionKey;
                return (
                  <button
                    key={session.sessionKey}
                    onClick={() => setSelectedWeekendKey(session.sessionKey)}
                    className={`flex min-w-36 items-center justify-between gap-3 rounded-sm border px-3 py-2 text-left ${active ? "border-primary bg-secondary" : "border-border hover:border-muted-foreground/50"}`}
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
          )}
          {selectedWeekendSession && selectedWeekendState === "upcoming" && (
            <div className="panel p-10 text-center">
              <RaceStatusBadge state="upcoming" />
              <p className="headline mt-4 text-2xl">
                {selectedWeekendSession.name}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Starts in</p>
              <div className="mx-auto mt-5 max-w-xl">
                <Countdown targetIso={selectedWeekendSession.startsAt} />
              </div>
            </div>
          )}
          {selectedWeekendState === "live" && liveTiming.isPending && (
            <StatusPanel
              title="Connecting to live timing"
              message="Fetching the active session timing snapshot…"
            />
          )}
          {selectedWeekendState === "live" && liveTiming.error && (
            <StatusPanel
              title="Live timing unavailable"
              message={liveTiming.error.message}
              tone="error"
            />
          )}
          {selectedWeekendState === "finished" &&
            historicalTiming.isPending && (
              <StatusPanel
                title="Loading session times"
                message={`Fetching ${selectedWeekendSession?.name ?? "session"} classification…`}
              />
            )}
          {selectedWeekendState === "finished" && historicalTiming.error && (
            <StatusPanel
              title="Session times unavailable"
              message={historicalTiming.error.message}
              tone="error"
            />
          )}
          {((selectedWeekendState === "live" &&
            liveTiming.data?.rows.length === 0) ||
            (selectedWeekendState === "finished" &&
              historicalTiming.data?.rows.length === 0)) && (
            <StatusPanel
              title="No timing data"
              message="The provider returned no timing rows for this session."
            />
          )}
          {(() => {
            const timing =
              selectedWeekendState === "live"
                ? liveTiming.data
                : selectedWeekendState === "finished"
                  ? historicalTiming.data
                  : undefined;
            if (!timing || timing.rows.length === 0) return null;
            return (
              <div className="panel">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <div>
                    <p className="headline text-sm">
                      {selectedWeekendSession?.name ?? timing.sessionName}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {timing.freshness.source === "f1-signalr"
                        ? "F1 live timing"
                        : "OpenF1"}{" "}
                      · session {timing.sessionKey}
                    </p>
                  </div>
                  <RaceStatusBadge
                    state={selectedWeekendState}
                    pulse={selectedWeekendState === "live"}
                  />
                </div>
                <LiveTimingTable timing={timing} />
              </div>
            );
          })()}
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
              Stylised outline with sector thirds and turn markers. Driver
              position markers appear when positional telemetry is integrated —
              none are fabricated.
            </p>
          </div>
          <div className="space-y-4">
            <div className="panel p-5">
              <h3 className="headline text-sm">Circuit facts</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Fact label="Length" value={`${circuit.lengthKm} km`} />
                <Fact label="Turns" value={String(circuit.turns)} />
                <Fact
                  label="First Grand Prix"
                  value={String(circuit.firstGrandPrix)}
                />
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
                  Position markers will highlight this driver once live
                  telemetry is connected.
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
      {view === "strategy" && strategyQuery.isPending && strategySession && (
        <StatusPanel
          title="Loading strategy data"
          message={`Fetching laps, stints and pit stops for ${strategySession.name}…`}
        />
      )}
      {view === "strategy" && strategyQuery.error && (
        <StatusPanel
          title="Strategy data unavailable"
          message={strategyQuery.error.message}
          tone="error"
        />
      )}
      {view === "strategy" && !strategySession && !weekend.isPending && (
        <StatusPanel
          title="No completed session"
          message="Strategy analysis will appear after the first session has recorded laps."
        />
      )}
      {view === "strategy" &&
        strategyQuery.data &&
        strategyQuery.data.drivers.length === 0 && (
          <StatusPanel
            title="No strategy data"
            message="The provider returned no drivers for this session."
          />
        )}
      {view === "strategy" && selectedStrategy && strategySession && (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-3 text-xs text-muted-foreground">
                  Session
                  <select
                    value={strategySession.sessionKey}
                    onChange={(event) =>
                      setSelectedWeekendKey(Number(event.target.value))
                    }
                    className="rounded-sm border border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground"
                  >
                    {weekend.data?.sessions
                      .filter(
                        (session) =>
                          getWeekendSessionState(session) !== "upcoming",
                      )
                      .map((session) => (
                        <option
                          key={session.sessionKey}
                          value={session.sessionKey}
                        >
                          {session.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="flex items-center gap-3 text-xs text-muted-foreground">
                  Analyse driver
                  <select
                    value={selectedStrategy.driverNumber}
                    onChange={(event) =>
                      setSelectedStrategyDriver(Number(event.target.value))
                    }
                    className="rounded-sm border border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground"
                  >
                    {strategyQuery.data?.drivers.map((driver) => (
                      <option
                        key={driver.driverNumber}
                        value={driver.driverNumber}
                      >
                        {driver.driverCode} · {driver.driverName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <span className="text-xs text-muted-foreground">
                OpenF1 · session {strategySession.sessionKey}
              </span>
            </div>
            <LapProgressionChart
              primary={selectedStrategy}
              {...(teamMateStrategy ? { secondary: teamMateStrategy } : {})}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <StintPanel strategy={selectedStrategy} />
              <PaceSummaryPanel strategy={selectedStrategy} />
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
                setView("timing");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`panel flex items-center justify-between p-4 text-left transition-colors hover:border-muted-foreground/50 ${
                r.id === race.id ? "border-primary" : ""
              }`}
            >
              <div>
                <p className="tabular text-[10px] text-muted-foreground">
                  R{r.round}
                </p>
                <p className="mt-1 text-sm font-semibold">{r.name}</p>
                <p className="tabular mt-1 text-xs text-muted-foreground">
                  {new Date(r.startsAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
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
      <p
        className={`headline text-lg ${tone === "error" ? "text-primary" : ""}`}
      >
        {title}
      </p>
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
  if (now < startsAt - 3 * 24 * 3600_000) return "upcoming";
  if (now <= startsAt + 4 * 3600_000) return "live";
  return "finished";
}

function getWeekendSessionState(session: WeekendSession): SessionState {
  const now = Date.now();
  if (session.isCancelled) return "unavailable";
  if (now < new Date(session.startsAt).getTime()) return "upcoming";
  if (now <= new Date(session.endsAt).getTime()) return "live";
  return "finished";
}
