import { Link } from "@tanstack/react-router";
import { constructorById } from "@/data/constructors";
import { nationalityFlag, driverById } from "@/data/drivers";

export function ConstructorIdentity({
  teamId,
  size = "md",
  link = true,
}: {
  teamId: string;
  size?: "sm" | "md";
  link?: boolean;
}) {
  const c = constructorById(teamId);
  if (!c) return <span className="text-sm text-muted-foreground">Unknown team</span>;
  const inner = (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-3.5 w-1 rounded-full"
        style={{ backgroundColor: c.color }}
        aria-hidden
      />
      <span className={size === "sm" ? "text-xs font-semibold" : "text-sm font-semibold"}>
        {c.name}
      </span>
    </span>
  );
  if (!link) return inner;
  return (
    <Link
      to="/grid/constructors/$teamId"
      params={{ teamId }}
      className="hover:text-foreground transition-colors"
    >
      {inner}
    </Link>
  );
}

export function DriverIdentity({
  driverId,
  showNumber = false,
  size = "md",
  link = true,
}: {
  driverId: string;
  showNumber?: boolean;
  size?: "sm" | "md" | "lg";
  link?: boolean;
}) {
  const dr = driverById(driverId);
  if (!dr) return <span className="text-sm text-muted-foreground">Unknown driver</span>;
  const team = constructorById(dr.teamId);
  const textClass =
    size === "lg" ? "text-xl font-bold" : size === "md" ? "text-sm font-semibold" : "text-xs font-semibold";
  const inner = (
    <span className="inline-flex items-center gap-2.5">
      {team && (
        <span
          className="h-3.5 w-1 rounded-full"
          style={{ backgroundColor: team.color }}
          aria-hidden
        />
      )}
      <span className={textClass}>
        {nationalityFlag(dr.countryCode)} {dr.name}
        {showNumber && (
          <span className="ml-1.5 tabular text-muted-foreground text-xs">#{dr.number}</span>
        )}
      </span>
    </span>
  );
  if (!link) return inner;
  return (
    <Link
      to="/grid/drivers/$driverId"
      params={{ driverId }}
      className="hover:text-foreground transition-colors"
    >
      {inner}
    </Link>
  );
}
