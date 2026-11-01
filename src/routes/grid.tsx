import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageTitle } from "@/components/f1/SectionHeading";
import {
  constructorStandingsQuery,
  constructorsQuery,
  currentSeasonQuery,
  driverStandingsQuery,
  driversQuery,
} from "@/api/queries";

export const Route = createFileRoute("/grid")({
  head: () => ({
    meta: [
      { title: "The Grid — Drivers & Constructors | Apex F1" },
      {
        name: "description",
        content: "Browse every driver and constructor from the Apex F1 API.",
      },
      { property: "og:title", content: "The Grid — Apex F1" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: GridPage,
});

function GridPage() {
  const [tab, setTab] = useState<"drivers" | "constructors">("drivers");
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const season = useQuery(currentSeasonQuery());
  const drivers = useQuery(driversQuery());
  const constructors = useQuery(constructorsQuery());
  const driverStandings = useQuery({
    ...driverStandingsQuery(season.data?.year ?? 0),
    enabled: Boolean(season.data),
  });
  const constructorStandings = useQuery({
    ...constructorStandingsQuery(season.data?.year ?? 0),
    enabled: Boolean(season.data),
  });
  const driverTeam = useMemo(
    () =>
      new Map(
        (driverStandings.data ?? []).map((row) => [
          row.driver.slug,
          row.constructor,
        ]),
      ),
    [driverStandings.data],
  );
  const filteredDrivers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (drivers.data ?? []).filter((driver) => {
      const team = driverTeam.get(driver.slug);
      return (
        `${driver.givenName} ${driver.familyName} ${driver.code ?? ""} ${driver.nationality}`
          .toLowerCase()
          .includes(needle) &&
        (teamFilter === "all" || team?.slug === teamFilter)
      );
    });
  }, [drivers.data, driverTeam, query, teamFilter]);
  const filteredTeams = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (constructors.data ?? []).filter((team) =>
      `${team.name} ${team.nationality}`.toLowerCase().includes(needle),
    );
  }, [constructors.data, query]);
  const pending =
    season.isPending || drivers.isPending || constructors.isPending;
  const error = season.error ?? drivers.error ?? constructors.error;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageTitle
        eyebrow="The Grid"
        title="Drivers & constructors"
        description={
          season.data
            ? `${season.data.year} championship field and standings from the Apex F1 API.`
            : "Championship field and standings from the Apex F1 API."
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search drivers or teams…"
            className="w-64 rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
          {tab === "drivers" && (
            <select
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
              className="rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none"
            >
              <option value="all">All teams</option>
              {(constructors.data ?? []).map((team) => (
                <option key={team.id} value={team.slug}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </PageTitle>
      <div className="mt-6 flex gap-1 border-b border-border">
        {(["drivers", "constructors"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest transition-colors ${tab === item ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {pending ? (
        <GridStatus
          title="Loading the grid…"
          message="Fetching drivers, constructors and the current season."
        />
      ) : error ? (
        <GridStatus
          title="The Grid is unavailable"
          message={error.message}
          action={() => {
            void season.refetch();
            void drivers.refetch();
            void constructors.refetch();
          }}
        />
      ) : tab === "drivers" ? (
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filteredDrivers.map((driver) => {
            const team = driverTeam.get(driver.slug);
            const standing = driverStandings.data?.find(
              (row) => row.driver.slug === driver.slug,
            );
            return (
              <Link
                key={driver.id}
                to="/grid/drivers/$driverId"
                params={{ driverId: driver.slug }}
                className="panel group p-5 transition-colors hover:border-muted-foreground/40"
              >
                <div className="flex items-start justify-between">
                  <span className="headline text-4xl text-muted-foreground/30 group-hover:text-foreground/40">
                    {driver.permanentNumber ?? "—"}
                  </span>
                  <span className="tabular text-xs text-muted-foreground">
                    {standing ? `P${standing.position}` : "—"}
                  </span>
                </div>
                <h3 className="headline mt-4 text-lg">
                  {driver.givenName} {driver.familyName}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {driver.nationality}
                  {team ? ` · ${team.name}` : ""}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 tabular text-xs text-muted-foreground">
                  <span>{standing?.points ?? 0} pts</span>
                  <span>{standing?.wins ?? 0} wins</span>
                  <span>{driver.code ?? "—"}</span>
                </div>
              </Link>
            );
          })}
          {filteredDrivers.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              {drivers.data?.length
                ? "No drivers match those filters."
                : "No drivers are available from the API yet."}
            </p>
          )}
        </section>
      ) : (
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => {
            const standing = constructorStandings.data?.find(
              (row) => row.constructor.slug === team.slug,
            );
            const lineUp = (driverStandings.data ?? []).filter(
              (row) => row.constructor?.slug === team.slug,
            );
            return (
              <Link
                key={team.id}
                to="/grid/constructors/$teamId"
                params={{ teamId: team.slug }}
                className="panel group p-6 transition-colors hover:border-muted-foreground/40"
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-[10px] text-muted-foreground">
                    {team.nationality}
                  </span>
                  <span className="tabular text-xs text-muted-foreground">
                    {standing
                      ? `P${standing.position} · ${standing.points} pts`
                      : "Not ranked"}
                  </span>
                </div>
                <h3 className="headline mt-4 text-xl">{team.name}</h3>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {lineUp.map((row) => (
                    <span
                      key={row.driver.id}
                      className="rounded-sm bg-secondary px-2 py-1 text-[11px] font-semibold"
                    >
                      {row.driver.code ?? row.driver.familyName}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
          {filteredTeams.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              {constructors.data?.length
                ? "No constructors match that search."
                : "No constructors are available from the API yet."}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function GridStatus({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: () => void;
}) {
  return (
    <div className="panel mt-6 p-12 text-center">
      <p className="headline text-xl">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {action && (
        <button
          onClick={action}
          className="mt-5 rounded-sm bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground"
        >
          Try again
        </button>
      )}
    </div>
  );
}
