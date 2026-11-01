import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { constructorById, constructors } from "@/data/constructors";
import { driversForTeam, nationalityFlag } from "@/data/drivers";
import { constructorStandings } from "@/data/standings";
import { carsForTeam } from "@/data/cars";
import { champions } from "@/data/history";
import { notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/grid_/constructors/$teamId")({
  head: ({ params }) => {
    const team = constructorById(params.teamId);
    return {
      meta: [
        { title: team ? `${team.name} — The Grid | Apex F1` : "Constructor — The Grid | Apex F1" },
        { name: "description", content: team ? `${team.fullName} — history, line-up, achievements and cars.` : "Constructor profile." },
        { property: "og:title", content: team ? `${team.name} — Apex F1` : "Constructor — Apex F1" },
        { property: "og:description", content: team ? `Line-up, history and cars of ${team.fullName}.` : "Constructor profile." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    if (!constructorById(params.teamId)) throw notFound();
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <p className="headline text-3xl">Constructor not found</p>
      <Link to="/grid" className="mt-6 inline-block text-sm font-semibold text-primary">Back to The Grid →</Link>
    </div>
  ),
  component: ConstructorProfilePage,
});

function ConstructorProfilePage() {
  const { teamId } = Route.useParams();
  const team = constructorById(teamId)!;
  const lineUp = driversForTeam(team.id);
  const teamCars = carsForTeam(team.id);
  const pos = constructorStandings.findIndex((s) => s.teamId === team.id) + 1;
  const points = constructorStandings.find((s) => s.teamId === team.id)?.points ?? 0;
  const titles = champions.filter((c) => c.constructorId === team.id);

  return (
    <div>
      <section className="border-b border-border" style={{ background: `linear-gradient(180deg, ${team.color}22 0%, transparent 60%)` }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <Link to="/grid" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to The Grid
          </Link>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-10 w-2.5 rounded-sm" style={{ backgroundColor: team.color }} />
                <h1 className="headline text-4xl sm:text-6xl">{team.name}</h1>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {team.fullName} · {team.base} · {team.engineSupplier} power
              </p>
            </div>
            <div className="flex gap-3">
              <Stat label="Championship" value={pos > 0 ? `P${pos}` : "—"} />
              <Stat label="Points" value={String(points)} />
              <Stat label="Constructors' titles" value={String(team.constructorsTitles)} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <section className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="headline text-xl">Team identity</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <FactRow label="Full name" value={team.fullName} />
              <FactRow label="Headquarters" value={team.base} />
              <FactRow label="Power unit" value={team.engineSupplier} />
              <FactRow label="Team principal" value={team.teamPrincipal} />
              <FactRow label="F1 debut" value={String(team.debutYear)} />
              <FactRow label="First title" value={team.firstTitleYear ? String(team.firstTitleYear) : "None"} />
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{team.shortHistory}</p>

            <h2 className="headline mt-10 text-xl">Current line-up</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {lineUp.map((d) => (
                <Link
                  key={d.id}
                  to="/grid/drivers/$driverId"
                  params={{ driverId: d.id }}
                  className="panel group flex items-center justify-between p-5 transition-colors hover:border-muted-foreground/40"
                >
                  <div>
                    <p className="tabular text-2xl font-bold" style={{ color: team.color }}>#{d.number}</p>
                    <h3 className="headline mt-1 text-lg">{d.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {nationalityFlag(d.countryCode)} {d.nationality}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>

            <h2 className="headline mt-10 text-xl">Championship achievements</h2>
            {team.constructorsTitles > 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {team.constructorsTitles} constructors' titles
                {team.firstTitleYear ? `, first in ${team.firstTitleYear}` : ""}
                {titles.length > 0 ? ` — including ${titles[titles.length - 1]!.season} with ${titles[titles.length - 1]!.driverName}.` : "."}
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No constructors' titles yet.</p>
            )}
          </div>

          <aside>
            <div className="panel p-5">
              <h3 className="headline text-sm">Cars</h3>
              <div className="mt-3 space-y-2">
                {teamCars.map((c) => (
                  <Link
                    key={c.id}
                    to="/garage/$carId"
                    params={{ carId: c.id }}
                    className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5 text-xs font-semibold transition-colors hover:border-primary/60"
                  >
                    <span>
                      {c.designation} · {c.season}
                      {!c.designationVerified && <em className="ml-1.5 text-[10px] text-muted-foreground/70">unverified</em>}
                    </span>
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
            <div className="panel mt-4 p-5">
              <h3 className="headline text-sm">Other constructors</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {constructors
                  .filter((c) => c.id !== team.id)
                  .map((c) => (
                    <Link
                      key={c.id}
                      to="/grid/constructors/$teamId"
                      params={{ teamId: c.id }}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </Link>
                  ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3 text-center">
      <p className="tabular text-lg font-bold">{value}</p>
      <p className="eyebrow mt-1 text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-3">
      <dt className="eyebrow text-[9px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xs font-semibold">{value}</dd>
    </div>
  );
}
