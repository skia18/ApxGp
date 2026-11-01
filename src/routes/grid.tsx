import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageTitle } from "@/components/f1/SectionHeading";
import { driverStandings, constructorStandings } from "@/data/standings";
import { drivers } from "@/data/drivers";
import { constructors } from "@/data/constructors";
import { SampleDataBadge } from "@/components/f1/RaceStatusBadge";

export const Route = createFileRoute("/grid")({
  head: () => ({
    meta: [
      { title: "The Grid — Drivers & Constructors | Apex F1" },
      { name: "description", content: "Browse every driver and constructor, with profiles, statistics and season line-ups." },
      { property: "og:title", content: "The Grid — Apex F1" },
      { property: "og:description", content: "Driver and constructor directory with profiles and statistics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GridPage,
});

function GridPage() {
  const [tab, setTab] = useState<"drivers" | "constructors">("drivers");
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");

  const filteredDrivers = useMemo(
    () =>
      drivers.filter((d) => {
        const matchesQuery = `${d.name} ${d.nationality} ${d.abbreviation}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesTeam = teamFilter === "all" || d.teamId === teamFilter;
        return matchesQuery && matchesTeam;
      }),
    [query, teamFilter],
  );

  const filteredTeams = useMemo(
    () => constructors.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageTitle
        eyebrow="The Grid"
        title="Drivers & constructors"
        description="Season-specific line-ups with career statistics. Every driver's team history is tracked per season — a driver's current team is not their career-long team."
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drivers or teams…"
            className="w-64 rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none"
          >
            <option value="all">All teams</option>
            {constructors.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <SampleDataBadge />
        </div>
      </PageTitle>

      <div className="mt-6 flex gap-1 border-b border-border">
        {(["drivers", "constructors"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest transition-colors ${
              tab === t
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "drivers" ? (
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filteredDrivers.map((dr) => {
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
                  <span className="headline text-4xl text-muted-foreground/30 group-hover:text-foreground/40">
                    {dr.number}
                  </span>
                  <span className="h-4 w-1 rounded-full" style={{ backgroundColor: team?.color }} />
                </div>
                <h3 className="headline mt-4 text-lg">{dr.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dr.nationality} · {team?.name}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 tabular text-xs text-muted-foreground">
                  <span>{standing?.points ?? 0} pts</span>
                  <span>{dr.raceWins} wins</span>
                  <span>{dr.polePositions} poles</span>
                </div>
              </Link>
            );
          })}
          {filteredDrivers.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No drivers match that search.
            </p>
          )}
        </section>
      ) : (
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((c) => {
            const lineUp = drivers.filter((d) => d.teamId === c.id);
            const standing = constructorStandings.find((s) => s.teamId === c.id);
            return (
              <Link
                key={c.id}
                to="/grid/constructors/$teamId"
                params={{ teamId: c.id }}
                className="panel group p-6 transition-colors hover:border-muted-foreground/40"
              >
                <div className="flex items-center justify-between">
                  <span className="h-4 w-6 rounded-sm" style={{ backgroundColor: c.color }} />
                  <span className="tabular text-xs text-muted-foreground">
                    P{constructorStandings.findIndex((s) => s.teamId === c.id) + 1} · {standing?.points} pts
                  </span>
                </div>
                <h3 className="headline mt-4 text-xl">{c.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.base} · {c.engineSupplier} power
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {lineUp.map((d) => (
                    <span key={d.id} className="rounded-sm bg-secondary px-2 py-1 text-[11px] font-semibold">
                      {d.abbreviation}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
