import { Link } from "@tanstack/react-router";
import { constructorById } from "@/data/constructors";
import { driverById, nationalityFlag } from "@/data/drivers";
import type { DriverStanding, ConstructorStanding } from "@/data/types";
import type {
  ConstructorStanding as ApiConstructorStanding,
  DriverStanding as ApiDriverStanding,
} from "@/api/client";
import { SampleDataBadge } from "./RaceStatusBadge";

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? "th");
};

export function DriverStandingsTable({
  standings,
  limit,
}: {
  standings: DriverStanding[];
  limit?: number;
}) {
  const rows = limit ? standings.slice(0, limit) : standings;
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
          <th className="w-10 py-2.5 font-semibold">Pos</th>
          <th className="py-2.5 font-semibold">Driver</th>
          <th className="hidden py-2.5 font-semibold sm:table-cell">Team</th>
          <th className="py-2.5 text-right font-semibold">Wins</th>
          <th className="py-2.5 text-right font-semibold">Points</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s, i) => {
          const dr = driverById(s.driverId);
          const team = dr ? constructorById(dr.teamId) : undefined;
          if (!dr) return null;
          return (
            <tr
              key={s.driverId}
              className="group border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors"
            >
              <td className="py-2.5 tabular text-sm font-semibold text-muted-foreground">
                {ordinal(i + 1)}
              </td>
              <td className="py-2.5">
                <Link
                  to="/grid/drivers/$driverId"
                  params={{ driverId: dr.id }}
                  className="flex items-center gap-2.5"
                >
                  <span
                    className="h-4 w-1 rounded-full"
                    style={{ backgroundColor: team?.color }}
                  />
                  <span className="text-sm font-semibold group-hover:text-foreground">
                    {dr.abbreviation}
                    <span className="ml-2 hidden font-normal text-muted-foreground md:inline">
                      {dr.name}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {nationalityFlag(dr.countryCode)}
                  </span>
                </Link>
              </td>
              <td className="hidden py-2.5 sm:table-cell">
                <span className="text-xs text-muted-foreground">
                  {team?.name}
                </span>
              </td>
              <td className="py-2.5 text-right tabular text-sm text-muted-foreground">
                {s.wins}
              </td>
              <td className="py-2.5 text-right tabular text-sm font-semibold">
                {s.points}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ConstructorStandingsTable({
  standings,
  limit,
}: {
  standings: ConstructorStanding[];
  limit?: number;
}) {
  const rows = limit ? standings.slice(0, limit) : standings;
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
          <th className="w-10 py-2.5 font-semibold">Pos</th>
          <th className="py-2.5 font-semibold">Constructor</th>
          <th className="py-2.5 text-right font-semibold">Wins</th>
          <th className="py-2.5 text-right font-semibold">Points</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s, i) => {
          const c = constructorById(s.teamId);
          if (!c) return null;
          return (
            <tr
              key={s.teamId}
              className="group border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors"
            >
              <td className="py-2.5 tabular text-sm font-semibold text-muted-foreground">
                {ordinal(i + 1)}
              </td>
              <td className="py-2.5">
                <Link
                  to="/grid/constructors/$teamId"
                  params={{ teamId: c.id }}
                  className="flex items-center gap-2.5"
                >
                  <span
                    className="h-4 w-1 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm font-semibold group-hover:text-foreground">
                    {c.name}
                  </span>
                </Link>
              </td>
              <td className="py-2.5 text-right tabular text-sm text-muted-foreground">
                {s.wins}
              </td>
              <td className="py-2.5 text-right tabular text-sm font-semibold">
                {s.points}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ApiDriverStandingsTable({
  standings,
  limit,
}: {
  standings: ApiDriverStanding[];
  limit?: number;
}) {
  const rows = limit ? standings.slice(0, limit) : standings;
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
          <th className="w-10 py-2.5 font-semibold">Pos</th>
          <th className="py-2.5 font-semibold">Driver</th>
          <th className="hidden py-2.5 font-semibold sm:table-cell">Team</th>
          <th className="py-2.5 text-right font-semibold">Wins</th>
          <th className="py-2.5 text-right font-semibold">Points</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((standing) => (
          <tr
            key={standing.driver.id}
            className="border-b border-border/50 last:border-0"
          >
            <td className="py-2.5 tabular text-sm font-semibold text-muted-foreground">
              {ordinal(standing.position)}
            </td>
            <td className="py-2.5 text-sm font-semibold">
              {standing.driver.code ?? standing.driver.familyName}
              <span className="ml-2 hidden font-normal text-muted-foreground md:inline">
                {standing.driver.givenName} {standing.driver.familyName}
              </span>
            </td>
            <td className="hidden py-2.5 text-xs text-muted-foreground sm:table-cell">
              {standing.constructor?.name ?? "—"}
            </td>
            <td className="py-2.5 text-right tabular text-sm text-muted-foreground">
              {standing.wins}
            </td>
            <td className="py-2.5 text-right tabular text-sm font-semibold">
              {standing.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ApiConstructorStandingsTable({
  standings,
  limit,
}: {
  standings: ApiConstructorStanding[];
  limit?: number;
}) {
  const rows = limit ? standings.slice(0, limit) : standings;
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
          <th className="w-10 py-2.5 font-semibold">Pos</th>
          <th className="py-2.5 font-semibold">Constructor</th>
          <th className="py-2.5 text-right font-semibold">Wins</th>
          <th className="py-2.5 text-right font-semibold">Points</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((standing) => (
          <tr
            key={standing.constructor.id}
            className="border-b border-border/50 last:border-0"
          >
            <td className="py-2.5 tabular text-sm font-semibold text-muted-foreground">
              {ordinal(standing.position)}
            </td>
            <td className="py-2.5 text-sm font-semibold">
              {standing.constructor.name}
            </td>
            <td className="py-2.5 text-right tabular text-sm text-muted-foreground">
              {standing.wins}
            </td>
            <td className="py-2.5 text-right tabular text-sm font-semibold">
              {standing.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function StandingsPanel({
  title,
  children,
  to,
}: {
  title: string;
  children: React.ReactNode;
  to: string;
}) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="headline text-sm">{title}</h3>
        <Link
          to={to}
          className="text-xs font-semibold text-primary hover:text-racing-red-bright"
        >
          Full standings →
        </Link>
      </div>
      {children}
    </div>
  );
}

export { SampleDataBadge as StandingsSampleBadge };
