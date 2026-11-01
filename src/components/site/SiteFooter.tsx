import { Link } from "@tanstack/react-router";
import { BrandMark } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-graphite mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            A premium digital home for Formula 1 — race centre, grid, garage,
            learning and history.
          </p>
          <p className="mt-6 text-xs text-muted-foreground/70">
            Sample data shown throughout pending a live data integration.
            Unaffiliated with Formula 1 or its teams.
          </p>
        </div>
        <FooterCol
          title="Platform"
          links={[
            { label: "Race Centre", to: "/race-centre" },
            { label: "The Grid", to: "/grid" },
            { label: "The Garage", to: "/garage" },
          ]}
        />
        <FooterCol
          title="Explore"
          links={[
            { label: "Learn F1", to: "/learn" },
            { label: "History & Records", to: "/history" },
            { label: "Homepage", to: "/" },
          ]}
        />
        <FooterCol
          title="Popular"
          links={[
            { label: "Verstappen", to: "/grid/drivers/verstappen" },
            { label: "Ferrari", to: "/grid/constructors/ferrari" },
            { label: "Garage viewer", to: "/garage/ferrari-2026/viewer" },
          ]}
        />
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <h3 className="eyebrow text-muted-foreground">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
