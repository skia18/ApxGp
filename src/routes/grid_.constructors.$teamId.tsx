import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  constructorQuery,
  constructorStandingsQuery,
  currentSeasonQuery,
  driverStandingsQuery,
} from "@/api/queries";
import { constructorById } from "@/data/constructors";

export const Route = createFileRoute("/grid_/constructors/$teamId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.teamId} — The Grid | Apex F1` },
      {
        name: "description",
        content:
          "Constructor profile, line-up and championship standing from the Apex F1 API.",
      },
    ],
  }),
  component: ConstructorProfilePage,
});

function ConstructorProfilePage() {
  const { teamId } = Route.useParams();
  const team = useQuery(constructorQuery(teamId));
  const season = useQuery(currentSeasonQuery());
  const constructorStandings = useQuery({
    ...constructorStandingsQuery(season.data?.year ?? 0),
    enabled: Boolean(season.data),
  });
  const driverStandings = useQuery({
    ...driverStandingsQuery(season.data?.year ?? 0),
    enabled: Boolean(season.data),
  });
  const standing = constructorStandings.data?.find(
    (row) => row.constructor.slug === teamId,
  );
  const lineUp = (driverStandings.data ?? []).filter(
    (row) => row.constructor?.slug === teamId,
  );
  const editorial = constructorById(teamId);

  if (team.isPending)
    return (
      <ProfileStatus
        title="Loading constructor…"
        message="Fetching this profile from the Apex F1 API."
      />
    );
  if (team.error)
    return (
      <ProfileStatus
        title="Constructor unavailable"
        message={team.error.message}
        retry={() => void team.refetch()}
      />
    );
  if (!team.data)
    return (
      <ProfileStatus
        title="Constructor not found"
        message="The API did not return a constructor for this identifier."
      />
    );
  const item = team.data;

  return (
    <div>
      <section
        className="border-b border-border"
        style={{
          background: `linear-gradient(180deg, ${editorial?.color ?? "#ffffff"}22 0%, transparent 60%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <Link
            to="/grid"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to The Grid
          </Link>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-center gap-3">
              {editorial && (
                <span
                  className="h-10 w-2.5 rounded-sm"
                  style={{ backgroundColor: editorial.color }}
                />
              )}
              <div>
                <h1 className="headline text-4xl sm:text-6xl">{item.name}</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  {item.nationality}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Stat
                label="Championship"
                value={standing ? `P${standing.position}` : "—"}
              />
              <Stat label="Points" value={String(standing?.points ?? 0)} />
              <Stat label="Season wins" value={String(standing?.wins ?? 0)} />
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <section className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="headline text-xl">Team identity</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Fact label="Constructor" value={item.name} />
              <Fact label="Nationality" value={item.nationality} />
              {editorial && (
                <>
                  <Fact label="Headquarters" value={editorial.base} />
                  <Fact label="Power unit" value={editorial.engineSupplier} />
                </>
              )}
            </dl>
            {editorial?.shortHistory && (
              <div className="mt-8">
                <p className="eyebrow text-[10px] text-muted-foreground">
                  Editorial profile
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {editorial.shortHistory}
                </p>
              </div>
            )}
            <h2 className="headline mt-10 text-xl">
              {season.data ? `${season.data.year} line-up` : "Current line-up"}
            </h2>
            {driverStandings.isPending ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Loading drivers…
              </p>
            ) : driverStandings.error ? (
              <p className="mt-4 text-sm text-primary">
                The line-up is unavailable.
              </p>
            ) : lineUp.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No drivers are linked to this constructor in the current
                standings.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {lineUp.map((row) => (
                  <Link
                    key={row.driver.id}
                    to="/grid/drivers/$driverId"
                    params={{ driverId: row.driver.slug }}
                    className="panel group flex items-center justify-between p-5 transition-colors hover:border-muted-foreground/40"
                  >
                    <div>
                      <p className="tabular text-2xl font-bold">
                        #{row.driver.permanentNumber ?? "—"}
                      </p>
                      <h3 className="headline mt-1 text-lg">
                        {row.driver.givenName} {row.driver.familyName}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {row.driver.nationality} · P{row.position}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>
          <aside>
            <div className="panel p-5">
              <h3 className="headline text-sm">
                {season.data
                  ? `${season.data.year} championship`
                  : "Current championship"}
              </h3>
              {constructorStandings.isPending ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Loading standing…
                </p>
              ) : constructorStandings.error ? (
                <p className="mt-3 text-xs text-primary">
                  Standing unavailable.
                </p>
              ) : (
                <dl className="mt-4 space-y-3">
                  <Row
                    label="Position"
                    value={standing ? `P${standing.position}` : "Not ranked"}
                  />
                  <Row label="Points" value={String(standing?.points ?? 0)} />
                  <Row label="Wins" value={String(standing?.wins ?? 0)} />
                </dl>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

function ProfileStatus({
  title,
  message,
  retry,
}: {
  title: string;
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <p className="headline text-3xl">{title}</p>
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-5 bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground"
        >
          Try again
        </button>
      )}
      <div>
        <Link
          to="/grid"
          className="mt-6 inline-block text-sm font-semibold text-primary"
        >
          Back to The Grid →
        </Link>
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
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <dt className="eyebrow text-[9px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
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
