import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { constructorById } from "@/data/constructors";
import { driverById, nationalityFlag, driversForTeam } from "@/data/drivers";
import { driverStandingById, driverStandings } from "@/data/standings";
import { carsForTeam } from "@/data/cars";
import { notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/grid_/drivers/$driverId")({
  head: ({ params }) => {
    const dr = driverById(params.driverId);
    return {
      meta: [
        { title: dr ? `${dr.name} — The Grid | Apex F1` : "Driver — The Grid | Apex F1" },
        { name: "description", content: dr ? `${dr.name}, ${dr.nationality}, career statistics and season-by-season team history.` : "Driver profile." },
        { property: "og:title", content: dr ? `${dr.name} — Apex F1` : "Driver — Apex F1" },
        { property: "og:description", content: dr ? `Career stats, titles and team history for ${dr.name}.` : "Driver profile." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    if (!driverById(params.driverId)) throw notFound();
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <p className="headline text-3xl">Driver not found</p>
      <Link to="/grid" className="mt-6 inline-block text-sm font-semibold text-primary">Back to The Grid →</Link>
    </div>
  ),
  component: DriverProfilePage,
});

function DriverProfilePage() {
  const { driverId } = Route.useParams();
  const driver = driverById(driverId)!;
  const team = constructorById(driver.teamId);
  const standing = driverStandingById(driver.id);
  const championshipPos = driverStandings.findIndex((s) => s.driverId === driver.id) + 1;
  const teamMate = driversForTeam(driver.teamId).find((d) => d.id !== driver.id);
  const teamCars = carsForTeam(driver.teamId);

  return (
    <div>
      {/* Hero */}
      <section
        className="border-b border-border"
        style={{
          background: `linear-gradient(180deg, ${team?.color}22 0%, transparent 60%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <Link to="/grid" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to The Grid
          </Link>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="tabular text-6xl font-bold" style={{ color: team?.color }}>
                {driver.number}
              </p>
              <h1 className="headline mt-3 text-4xl sm:text-6xl">{driver.name}</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {nationalityFlag(driver.countryCode)} {driver.nationality} · {team?.name} · {driver.abbreviation}
              </p>
            </div>
            <div className="flex gap-3">
              <HeroStat label={`${seasonPosLabel(championshipPos)}`} value={`${standing?.points ?? 0} pts`} />
              <HeroStat label="Wins" value={String(driver.raceWins)} />
              <HeroStat label="Podiums" value={String(driver.podiums)} />
              <HeroStat label="Titles" value={String(driver.worldTitles)} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <section className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="headline text-xl">Profile</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{driver.bio}</p>

            <h2 className="headline mt-10 text-xl">Season-by-season team history</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Team relationships are season-specific — a driver's current team is not extended backwards through their career.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {driver.seasonHistory.map((h, i, arr) => {
                const prev = arr[i - 1];
                const changed = !prev || prev.teamId !== h.teamId;
                const c = constructorById(h.teamId);
                return (
                  <span
                    key={h.season}
                    className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[11px] ${
                      changed ? "border-muted-foreground/40 bg-secondary" : "border-border/60 text-muted-foreground"
                    }`}
                    title={changed ? "Joined" : ""}
                  >
                    <span className="tabular">{h.season}</span>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c?.color }} />
                    {c?.name}
                  </span>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="panel p-5">
              <h3 className="headline text-sm">Career statistics</h3>
              <dl className="mt-4 space-y-3">
                <Row label="Debut" value={String(driver.debutYear)} />
                <Row label="Race starts" value={String(driver.raceStarts)} />
                <Row label="Race wins" value={String(driver.raceWins)} />
                <Row label="Podiums" value={String(driver.podiums)} />
                <Row label="Pole positions" value={String(driver.polePositions)} />
                <Row label="World titles" value={String(driver.worldTitles)} />
              </dl>
            </div>

            <div className="panel p-5">
              <h3 className="headline text-sm">{team?.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{team?.shortHistory}</p>
              <Link
                to="/grid/constructors/$teamId"
                params={{ teamId: driver.teamId }}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                Team profile <ArrowRight className="h-3 w-3" />
              </Link>
              {teamMate && (
                <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
                  Team-mate:{" "}
                  <Link to="/grid/drivers/$driverId" params={{ driverId: teamMate.id }} className="font-semibold text-foreground hover:text-primary">
                    {teamMate.name}
                  </Link>
                </p>
              )}
            </div>

            <div className="panel p-5">
              <h3 className="headline text-sm">Car {driver.number} drives</h3>
              <div className="mt-3 space-y-2">
                {teamCars.map((c) => (
                  <Link
                    key={c.id}
                    to="/garage/$carId"
                    params={{ carId: c.id }}
                    className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5 text-xs font-semibold transition-colors hover:border-primary/60"
                  >
                    <span>{c.designation} · {c.season}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </Link>
                ))}
                {teamCars[0] && (
                  <Link
                    to="/garage/$carId/viewer"
                    params={{ carId: teamCars[0].id }}
                    className="block rounded-sm bg-primary px-3 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-racing-red-bright"
                  >
                    Explore in 3D
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

const seasonPosLabel = (pos: number) => (pos > 0 ? `P${pos} in championship` : "—");

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3 text-center">
      <p className="tabular text-lg font-bold">{value}</p>
      <p className="eyebrow mt-1 text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="tabular text-xs font-semibold">{value}</dd>
    </div>
  );
}
