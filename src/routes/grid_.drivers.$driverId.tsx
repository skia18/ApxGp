import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  driverQuery,
  currentSeasonQuery,
  driverStandingsQuery,
} from "@/api/queries";
import { driverById } from "@/data/drivers";
import { constructorById } from "@/data/constructors";

export const Route = createFileRoute("/grid_/drivers/$driverId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.driverId} — The Grid | Apex F1` },
      {
        name: "description",
        content:
          "Driver profile and current championship standing from the Apex F1 API.",
      },
    ],
  }),
  component: DriverProfilePage,
});

function DriverProfilePage() {
  const { driverId } = Route.useParams();
  const driver = useQuery(driverQuery(driverId));
  const season = useQuery(currentSeasonQuery());
  const standings = useQuery({
    ...driverStandingsQuery(season.data?.year ?? 0),
    enabled: Boolean(season.data),
  });
  const standing = standings.data?.find((row) => row.driver.slug === driverId);
  const editorial = driverById(driverId);
  const editorialTeam = standing?.constructor
    ? constructorById(standing.constructor.slug)
    : undefined;

  if (driver.isPending)
    return (
      <ProfileStatus
        title="Loading driver…"
        message="Fetching this profile from the Apex F1 API."
      />
    );
  if (driver.error)
    return (
      <ProfileStatus
        title="Driver unavailable"
        message={driver.error.message}
        retry={() => void driver.refetch()}
      />
    );
  if (!driver.data)
    return (
      <ProfileStatus
        title="Driver not found"
        message="The API did not return a driver for this identifier."
      />
    );
  const item = driver.data;

  return (
    <div>
      <section
        className="border-b border-border"
        style={{
          background: `linear-gradient(180deg, ${editorialTeam?.color ?? "#ffffff"}22 0%, transparent 60%)`,
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
            <div>
              <p className="tabular text-6xl font-bold text-muted-foreground">
                {item.permanentNumber ?? "—"}
              </p>
              <h1 className="headline mt-3 text-4xl sm:text-6xl">
                {item.givenName} {item.familyName}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {item.nationality}
                {standing?.constructor ? ` · ${standing.constructor.name}` : ""}
                {item.code ? ` · ${item.code}` : ""}
              </p>
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
            <h2 className="headline text-xl">Driver details</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Fact label="Driver code" value={item.code ?? "Not available"} />
              <Fact
                label="Permanent number"
                value={
                  item.permanentNumber
                    ? String(item.permanentNumber)
                    : "Not available"
                }
              />
              <Fact label="Nationality" value={item.nationality} />
              <Fact
                label="Date of birth"
                value={
                  item.dateOfBirth
                    ? new Date(item.dateOfBirth).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not available"
                }
              />
            </dl>
            {editorial?.bio && (
              <div className="mt-10">
                <p className="eyebrow text-[10px] text-muted-foreground">
                  Editorial profile
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {editorial.bio}
                </p>
              </div>
            )}
          </div>
          <aside className="space-y-4">
            <div className="panel p-5">
              <h3 className="headline text-sm">
                {season.data ? `${season.data.year} season` : "Current season"}
              </h3>
              {standings.isPending ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Loading championship standing…
                </p>
              ) : standings.error ? (
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
            {standing?.constructor && (
              <div className="panel p-5">
                <h3 className="headline text-sm">
                  {standing.constructor.name}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  {standing.constructor.nationality}
                </p>
                <Link
                  to="/grid/constructors/$teamId"
                  params={{ teamId: standing.constructor.slug }}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                >
                  Team profile <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
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
