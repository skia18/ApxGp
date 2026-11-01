import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CarViewer } from "@/components/garage/CarViewer";
import { constructorById } from "@/data/constructors";
import { carById } from "@/data/cars";
import { notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/garage_/$carId_/viewer")({
  ssr: false,
  head: ({ params }) => {
    const car = carById(params.carId);
    return {
      meta: [
        { title: car ? `${car.designation} 3D Viewer — Apex F1` : "3D Viewer — Apex F1" },
        { name: "description", content: "Interactive 3D car studio viewer with technical component annotations." },
        { property: "og:title", content: "3D Viewer — Apex F1" },
        { property: "og:description", content: "Rotate, zoom and inspect an F1 car with technical annotations." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    if (!carById(params.carId)) throw notFound();
  },
  component: ViewerPage,
});

function ViewerPage() {
  const { carId } = Route.useParams();
  const car = carById(carId)!;
  const team = constructorById(car.teamId);

  return (
    <div className="relative -mt-px">
      <div className="absolute left-4 top-3 z-10">
        <Link
          to="/garage/$carId"
          params={{ carId: car.id }}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {car.designation}
        </Link>
      </div>
      <CarViewer car={car} teamColor={team?.color ?? "#e10600"} teamName={team?.name ?? ""} />
    </div>
  );
}
