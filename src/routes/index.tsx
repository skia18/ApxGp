import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronRight, Radio } from "lucide-react";
import heroImage from "@/assets/hero-race.jpg";
import featuredCarImage from "@/assets/car-studio-red.jpg";
import { Countdown } from "@/components/f1/Countdown";
import { RaceStatusBadge, SampleDataBadge } from "@/components/f1/RaceStatusBadge";
import { SectionHeading, } from "@/components/f1/SectionHeading";
import {
  DriverStandingsTable,
  ConstructorStandingsTable,
  ApiDriverStandingsTable,
  ApiConstructorStandingsTable,
  StandingsPanel,
} from "@/components/f1/Standings";
import { ConstructorIdentity } from "@/components/f1/Identity";
import { driverStandings, constructorStandings } from "@/data/standings";
import { constructors } from "@/data/constructors";
import { drivers } from "@/data/drivers";
import { carById } from "@/data/cars";
import { learnTopics } from "@/data/learning";
import { champions } from "@/data/history";
import {
  constructorStandingsQuery,
  currentSeasonQuery,
  driverStandingsQuery,
  nextRaceQuery,
  raceSessionsQuery,
} from "@/api/queries";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const currentSeason = await context.queryClient.ensureQueryData(currentSeasonQuery());
    const race = await context.queryClient.ensureQueryData(nextRaceQuery());
    await Promise.all([
      context.queryClient.ensureQueryData(driverStandingsQuery(currentSeason.year)),
      context.queryClient.ensureQueryData(constructorStandingsQuery(currentSeason.year)),
      context.queryClient.ensureQueryData(raceSessionsQuery(race.id)),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Apex F1 — Formula 1 Race Centre, Grid, Garage & History" },
      { name: "description", content: "Countdown to the next Grand Prix, championship standings, an interactive 3D car garage, driver profiles, learning guides and history." },
      { property: "og:title", content: "Apex F1 — The premium Formula 1 platform" },
      { property: "og:description", content: "Race Centre, The Grid, The Garage, Learn F1 and History & Records in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: currentSeason } = useSuspenseQuery(currentSeasonQuery());
  const { data: race } = useSuspenseQuery(nextRaceQuery());
  const { data: liveDriverStandings } = useSuspenseQuery(
    driverStandingsQuery(currentSeason.year),
  );
  const { data: liveConstructorStandings } = useSuspenseQuery(
    constructorStandingsQuery(currentSeason.year),
  );
  const { data: sessions } = useSuspenseQuery(raceSessionsQuery(race.id));
  const featured = carById("ferrari-2026");
  const raceStart = new Date(race.startsAt).getTime();
  const raceActive = Date.now() >= raceStart - 3 * 24 * 3600_000 && Date.now() <= raceStart + 3 * 3600_000;

  return (
    <>
      {/* A. Cinematic race hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Formula 1 car at night under floodlights"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1088}
          fetchPriority="high"
        />
        <div className="hero-veil absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
          <div className="flex flex-wrap items-center gap-3">
            {raceActive ? (
              <RaceStatusBadge state="live" pulse />
            ) : (
              <RaceStatusBadge state="upcoming" />
            )}
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Round {race.round} · {currentSeason.year} FIA Formula One World Championship
            </span>
          </div>
          <h1 className="headline mt-6 max-w-3xl text-4xl sm:text-6xl lg:text-7xl">
            {race.name}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {race.circuit.name} · {race.circuit.locality}, {race.circuit.country}
          </p>
          <div className="mt-8 max-w-xl">
            <Countdown targetIso={race.startsAt} />
          </div>
          <p className="mt-4 tabular text-xs text-muted-foreground">
            Race start {new Date(race.startsAt).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/race-centre"
              className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-racing-red-bright"
            >
              <Radio className="h-4 w-4" /> Enter Race Centre
            </Link>
            <Link
              to="/race-centre"
              className="inline-flex items-center gap-2 border border-border bg-background/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-foreground backdrop-blur transition-colors hover:border-muted-foreground/50"
            >
              Explore the Circuit
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 sm:py-20">
        {/* B. Championship snapshot */}
        <section>
          <SectionHeading
            eyebrow={`${currentSeason.year} Season`}
            title="Championship snapshot"
            action={{ label: "Full standings", to: "/race-centre" }}
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <StandingsPanel title="Drivers' Championship" to="/race-centre">
              <ApiDriverStandingsTable standings={liveDriverStandings} limit={6} />
            </StandingsPanel>
            <StandingsPanel title="Constructors' Championship" to="/race-centre">
              <ApiConstructorStandingsTable standings={liveConstructorStandings} limit={6} />
            </StandingsPanel>
          </div>
        </section>

        {/* C. Race-weekend status */}
        <section>
          <SectionHeading eyebrow="Race weekend" title="Session status" action={{ label: "Live timing", to: "/race-centre" }} />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sessions.map((session) => (
              <div key={session.id} className="panel p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{session.name}</p>
                  <RaceStatusBadge
                    state={
                      session.startsAt && new Date(session.startsAt).getTime() < Date.now() - 3 * 3600 * 1000
                        ? "finished"
                        : "upcoming"
                    }
                  />
                </div>
                <p className="mt-3 tabular text-xs text-muted-foreground">
                  {session.startsAt
                    ? new Date(session.startsAt).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                    : "Start time to be confirmed"}
                </p>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="panel p-5 text-sm text-muted-foreground sm:col-span-2 lg:col-span-4">
                Session schedule has not been published by the data provider yet.
              </div>
            )}
          </div>
        </section>

        {/* D. Featured car */}
        {featured && (
          <section>
            <SectionHeading eyebrow="The Garage" title="Featured car" action={{ label: "Open the Garage", to: "/garage" }} />
            <div className="mt-6 grid overflow-hidden border border-border lg:grid-cols-2">
              <div className="relative min-h-[260px]">
                <img src={featuredCarImage} alt={`${featured.designation} in a dark studio`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" width={1920} height={1088} />
              </div>
              <div className="flex flex-col justify-center bg-card p-8 sm:p-12">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-1 rounded-full" style={{ backgroundColor: constructors.find((c) => c.id === featured.teamId)?.color }} />
                  <p className="eyebrow text-muted-foreground">
                    {constructors.find((c) => c.id === featured.teamId)?.name} · {featured.season}
                  </p>
                </div>
                <h3 className="headline mt-4 text-3xl sm:text-4xl">{featured.designation}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{featured.summary}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/garage/$carId/viewer"
                    params={{ carId: featured.id }}
                    className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-racing-red-bright"
                  >
                    Explore in 3D <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/garage/$carId"
                    params={{ carId: featured.id }}
                    className="inline-flex items-center border border-border px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors hover:border-muted-foreground/60"
                  >
                    Full specifications
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* E. Explore the grid */}
        <section>
          <SectionHeading eyebrow="The Grid" title="Follow the drivers" action={{ label: "Full grid", to: "/grid" }} />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {drivers.slice(0, 4).map((dr) => {
              const team = constructors.find((c) => c.id === dr.teamId);
              const standing = driverStandings.find((s) => s.driverId === dr.id);
              return (
                <Link
                  key={dr.id}
                  to="/grid/drivers/$driverId"
                  params={{ driverId: dr.id }}
                  className="panel group p-5 transition-colors hover:border-muted-foreground/40"
                >
                  <div className="flex items-start justify-between">
                    <span className="headline text-4xl text-muted-foreground/30 transition-colors group-hover:text-foreground/40">
                      {dr.number}
                    </span>
                    <span className="h-4 w-1 rounded-full" style={{ backgroundColor: team?.color }} />
                  </div>
                  <h3 className="headline mt-4 text-lg">{dr.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{team?.name}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 tabular text-xs text-muted-foreground">
                    <span>P{driverStandings.findIndex((s) => s.driverId === dr.id) + 1}</span>
                    <span>{standing?.points} pts</span>
                    <span>{standing?.wins} wins</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {constructors.map((c) => (
              <Link
                key={c.id}
                to="/grid/constructors/$teamId"
                params={{ teamId: c.id }}
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        {/* F. History & Records */}
        <section>
          <SectionHeading eyebrow="History & Records" title="Wall of Champions" action={{ label: "Full archive", to: "/history" }} />
          <div className="mt-6 flex snap-x gap-3 overflow-x-auto pb-2">
            {champions.slice(0, 8).map((ch) => (
              <Link
                key={ch.season}
                to="/history"
                className="panel group min-w-[220px] snap-start p-5 transition-colors hover:border-muted-foreground/40"
              >
                <p className="tabular text-xs text-muted-foreground">{ch.season}</p>
                <h3 className="headline mt-2 text-lg">{ch.driverName}</h3>
                <ConstructorIdentity teamId={ch.constructorId} size="sm" link={false} />
                <p className="mt-3 tabular text-xs text-muted-foreground">{ch.wins} wins · {ch.points} pts</p>
              </Link>
            ))}
          </div>
        </section>

        {/* G. Learn F1 */}
        <section>
          <SectionHeading eyebrow="Learn F1" title="Start with the basics" action={{ label: "Learning centre", to: "/learn" }} />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {learnTopics.slice(0, 4).map((t) => (
              <Link
                key={t.id}
                to="/learn"
                className="panel group p-5 transition-colors hover:border-muted-foreground/40"
              >
                <p className="eyebrow text-[10px] text-primary">{t.category}</p>
                <h3 className="mt-3 text-base font-bold">{t.title}</h3>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{t.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                  Read <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            Content adapts to the race calendar — during a race the Race Centre leads the homepage.
          </p>
          <SampleDataBadge />
        </div>
      </div>
    </>
  );
}
