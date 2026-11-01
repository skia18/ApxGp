import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Cog } from "lucide-react";
import carRed from "@/assets/car-studio-red.jpg";
import carSilver from "@/assets/car-studio-silver.jpg";
import carOrange from "@/assets/car-studio-orange.jpg";
import { constructorById } from "@/data/constructors";
import { carById, carsForTeam } from "@/data/cars";
import { notFound } from "@tanstack/react-router";

const IMAGE_SRC: Record<string, string> = { red: carRed, silver: carSilver, orange: carOrange };

export const Route = createFileRoute("/garage_/$carId")({
  head: ({ params }) => {
    const car = carById(params.carId);
    return {
      meta: [
        { title: car ? `${car.designation} — The Garage | Apex F1` : "Car — The Garage | Apex F1" },
        { name: "description", content: car ? `${car.summary}` : "F1 car specifications and technical overview." },
        { property: "og:title", content: car ? `${car.designation} — Apex F1` : "Car — Apex F1" },
        { property: "og:description", content: car ? car.summary : "F1 car specifications." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    if (!carById(params.carId)) throw notFound();
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <p className="headline text-3xl">Car not found</p>
      <Link to="/garage" className="mt-6 inline-block text-sm font-semibold text-primary">Back to the Garage →</Link>
    </div>
  ),
  component: CarDetailPage,
});

function CarDetailPage() {
  const { carId } = Route.useParams();
  const car = carById(carId)!;
  const team = constructorById(car.teamId);
  const teamCars = carsForTeam(car.teamId);
  const teamDrivers = ["placeholder"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/garage" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to catalogue
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden border border-border">
          <img
            src={IMAGE_SRC[car.image]}
            alt={`${team?.name} ${car.season} car in a dark studio`}
            width={1920}
            height={1088}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <span className="h-4 w-1 rounded-full" style={{ backgroundColor: team?.color }} />
            <p className="eyebrow text-muted-foreground">{team?.name} · {car.season}</p>
          </div>
          <h1 className="headline mt-4 text-4xl sm:text-5xl">{car.designation}</h1>
          {!car.designationVerified && (
            <p className="mt-1 text-xs text-muted-foreground/70">Car designation unverified — illustrative naming.</p>
          )}
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{car.summary}</p>
          <p className="mt-5 text-sm leading-relaxed">{team?.shortHistory}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/garage/$carId/viewer"
              params={{ carId: car.id }}
              className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-racing-red-bright"
            >
              <Cog className="h-4 w-4" /> Explore in 3D
            </Link>
            <Link
              to="/grid/constructors/$teamId"
              params={{ teamId: car.teamId }}
              className="inline-flex items-center border border-border px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors hover:border-muted-foreground/60"
            >
              {team?.name}
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="headline text-xl">Specifications</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <tbody>
              {car.specs.map((s, i) => (
                <tr key={s.label} className={i % 2 ? "bg-card" : "bg-secondary/40"}>
                  <td className="w-1/3 px-4 py-3 text-xs text-muted-foreground">{s.label}</td>
                  <td className="px-4 py-3 tabular text-xs">
                    {s.value}
                    {!s.verified && <em className="ml-2 text-[10px] text-muted-foreground/70">unverified</em>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="headline text-xl">Technical overview</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {car.components.slice(0, 4).map((comp) => (
            <div key={comp.id} className="panel p-4">
              <h3 className="text-sm font-bold">{comp.name}</h3>
              <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-muted-foreground">{comp.plain}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Full annotations for every component — including deeper technical explanations — are inside the 3D viewer.
        </p>
      </section>

      {teamCars.length > 1 && (
        <section className="mt-12">
          <h2 className="headline text-xl">More from {team?.name}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {teamCars
              .filter((c) => c.id !== car.id)
              .map((c) => (
                <Link
                  key={c.id}
                  to="/garage/$carId"
                  params={{ carId: c.id }}
                  className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  {c.designation} · {c.season} <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
          </div>
        </section>
      )}
      {teamDrivers.length === 0 && null}
    </div>
  );
}
