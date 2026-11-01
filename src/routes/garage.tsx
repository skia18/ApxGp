import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import carRed from "@/assets/car-studio-red.jpg";
import carSilver from "@/assets/car-studio-silver.jpg";
import carOrange from "@/assets/car-studio-orange.jpg";
import { PageTitle } from "@/components/f1/SectionHeading";
import { SampleDataBadge } from "@/components/f1/RaceStatusBadge";
import { cars } from "@/data/cars";
import { constructors } from "@/data/constructors";

export const Route = createFileRoute("/garage")({
  head: () => ({
    meta: [
      { title: "The Garage — F1 Car Catalogue & 3D Viewers | Apex F1" },
      {
        name: "description",
        content:
          "A premium catalogue of current Formula 1 cars with specifications, technical annotations and interactive 3D studio viewers.",
      },
      { property: "og:title", content: "The Garage — Apex F1" },
      {
        property: "og:description",
        content: "F1 car catalogue with specs and interactive 3D viewers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GaragePage,
});

const IMAGE_SRC: Record<string, string> = {
  red: carRed,
  silver: carSilver,
  orange: carOrange,
};

function GaragePage() {
  const [teamFilter, setTeamFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [compare, setCompare] = useState<string[]>([]);

  const filtered = useMemo(
    () =>
      cars.filter(
        (c) =>
          (teamFilter === "all" || c.teamId === teamFilter) &&
          (seasonFilter === "all" || String(c.season) === seasonFilter),
      ),
    [teamFilter, seasonFilter],
  );

  const toggleCompare = (id: string) =>
    setCompare((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 2
          ? [prev[1]!, id]
          : [...prev, id],
    );

  const compareCars = compare
    .map((id) => cars.find((c) => c.id === id)!)
    .filter(Boolean);
  const seasons = [...new Set(cars.map((c) => c.season))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageTitle
        eyebrow="The Garage"
        title="Car catalogue"
        description="Every current car with its constructor and season. Where a designation is unverified it is labelled as such — we do not present illustrative values as confirmed specifications."
      >
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none"
          >
            <option value="all">All constructors</option>
            {constructors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none"
          >
            <option value="all">All seasons</option>
            {seasons.map((s) => (
              <option key={s} value={String(s)}>
                {s}
              </option>
            ))}
          </select>
          <SampleDataBadge />
        </div>
      </PageTitle>

      {compare.length > 0 && (
        <div className="mt-6 panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="headline text-sm">Side-by-side comparison</h2>
            <button
              onClick={() => setCompare([])}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
          {compareCars.length === 2 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="py-2 pr-4 font-semibold">Spec</th>
                    {compareCars.map((c) => (
                      <th key={c.id} className="py-2 pr-4 font-semibold">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-3 w-1 rounded-full"
                            style={{
                              backgroundColor: constructors.find(
                                (x) => x.id === c.teamId,
                              )?.color,
                            }}
                          />
                          {c.designation}
                          <span className="text-muted-foreground">
                            · {c.season}
                          </span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareCars[0]!.specs.map((s, i) => {
                    const a = compareCars[0]!.specs[i]!;
                    const b = compareCars[1]!.specs[i];
                    return (
                      <tr
                        key={s.label}
                        className="border-b border-border/40 last:border-0"
                      >
                        <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                          {s.label}
                        </td>
                        <td className="py-2.5 pr-4 tabular text-xs">
                          {a.value}{" "}
                          {!a.verified && (
                            <em className="text-muted-foreground/70">
                              (sample)
                            </em>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 tabular text-xs">
                          {b?.value}{" "}
                          {!b?.verified && (
                            <em className="text-muted-foreground/70">
                              (sample)
                            </em>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="mt-3 text-[11px] text-muted-foreground/80">
                Only specifications flagged as regulation-verified are factual;
                unverified entries are illustrative. No performance advantages
                are claimed.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Select one more car below to compare (tick “Compare” on its card).
            </p>
          )}
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((car) => {
          const team = constructors.find((c) => c.id === car.teamId);
          const inCompare = compare.includes(car.id);
          return (
            <article
              key={car.id}
              className="panel group overflow-hidden transition-colors hover:border-muted-foreground/40"
            >
              <Link
                to="/garage/$carId"
                params={{ carId: car.id }}
                className="block"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={IMAGE_SRC[car.image]}
                    alt={`${team?.name} ${car.season} Formula 1 car in a dark studio`}
                    loading="lazy"
                    width={1920}
                    height={1088}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/90 to-transparent" />
                </div>
              </Link>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-1 rounded-full"
                    style={{ backgroundColor: team?.color }}
                  />
                  <p className="eyebrow text-[10px] text-muted-foreground">
                    {team?.name} · {car.season}
                  </p>
                </div>
                <h3 className="headline mt-2 text-xl">{car.designation}</h3>
                {!car.designationVerified && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                    designation unverified
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => toggleCompare(car.id)}
                    className={`rounded-sm border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                      inCompare
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {inCompare ? "In compare" : "Compare"}
                  </button>
                  <Link
                    to="/garage/$carId/viewer"
                    params={{ carId: car.id }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:text-racing-red-bright"
                  >
                    Explore in 3D <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No cars match those filters.
        </p>
      )}
    </div>
  );
}
