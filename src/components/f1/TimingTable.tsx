import { constructorById } from "@/data/constructors";
import { driverById } from "@/data/drivers";
import type { TimingRow } from "@/data/types";
import type { LiveTiming } from "@/api/client";

function compoundColor(c: string | null): string {
  switch (c) {
    case "S":
      return "#FF4554";
    case "M":
      return "#FFD12E";
    case "H":
      return "#EBEBEB";
    case "I":
      return "#43CD4A";
    case "W":
      return "#3B7FDB";
    default:
      return "transparent";
  }
}

function formatSeconds(value?: number): string {
  if (value === undefined) return "—";
  const minutes = Math.floor(value / 60);
  return `${minutes}:${(value - minutes * 60).toFixed(3).padStart(6, "0")}`;
}

export function LiveTimingTable({ timing }: { timing: LiveTiming }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            <th className="py-2.5 pl-3 pr-2 font-semibold">Pos</th>
            <th className="px-2 py-2.5 font-semibold">No.</th>
            <th className="px-2 py-2.5 font-semibold">Driver</th>
            <th className="hidden px-2 py-2.5 font-semibold md:table-cell">
              Constructor
            </th>
            <th className="px-2 py-2.5 text-right font-semibold">Lap</th>
            <th className="px-2 py-2.5 text-right font-semibold">Gap</th>
            <th className="px-2 py-2.5 text-right font-semibold">Interval</th>
            <th className="px-2 py-2.5 text-right font-semibold">Last</th>
            <th className="px-2 py-2.5 text-right font-semibold">Best</th>
            <th className="hidden px-2 py-2.5 text-center font-semibold lg:table-cell">
              S1 / S2 / S3
            </th>
          </tr>
        </thead>
        <tbody>
          {timing.rows.map((row) => (
            <tr
              key={row.driverNumber}
              className="border-b border-border/40 last:border-0 hover:bg-accent/60"
            >
              <td className="py-2.5 pl-3 pr-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-1 rounded-full"
                    style={{
                      backgroundColor: row.teamColour
                        ? `#${row.teamColour}`
                        : undefined,
                    }}
                  />
                  <span className="timing-cell font-semibold">
                    {row.position}
                  </span>
                </div>
              </td>
              <td className="timing-cell px-2 text-muted-foreground">
                {row.driverNumber}
              </td>
              <td className="px-2">
                <span className="text-[13px] font-semibold">
                  {row.driverCode}
                  <span className="ml-2 hidden font-normal text-muted-foreground md:inline">
                    {row.driverName}
                  </span>
                </span>
              </td>
              <td className="hidden px-2 md:table-cell">
                <span className="text-[13px] text-muted-foreground">
                  {row.teamName}
                </span>
              </td>
              <td className="timing-cell px-2 text-right text-muted-foreground">
                {row.lapNumber ?? "—"}
              </td>
              <td className="timing-cell px-2 text-right">
                {row.gapToLeader ?? "—"}
              </td>
              <td className="timing-cell px-2 text-right text-muted-foreground">
                {row.interval ?? "—"}
              </td>
              <td className="timing-cell px-2 text-right">
                {formatSeconds(row.lastLapSeconds)}
              </td>
              <td className="timing-cell px-2 text-right text-signal-purple">
                {formatSeconds(row.bestLapSeconds)}
              </td>
              <td className="timing-cell hidden px-2 text-center text-muted-foreground lg:table-cell">
                {row.sectors
                  .map((sector) => formatSeconds(sector ?? undefined))
                  .join(" / ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TimingTable({
  rows,
  selectedDriverId,
  onSelect,
}: {
  rows: TimingRow[];
  selectedDriverId: string | null;
  onSelect: (driverId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            <th className="py-2.5 pl-3 pr-2 font-semibold">Pos</th>
            <th className="py-2.5 px-2 font-semibold">No.</th>
            <th className="py-2.5 px-2 font-semibold">Driver</th>
            <th className="py-2.5 px-2 font-semibold hidden md:table-cell">
              Constructor
            </th>
            <th className="py-2.5 px-2 text-right font-semibold">Lap</th>
            <th className="py-2.5 px-2 text-right font-semibold">Gap</th>
            <th className="py-2.5 px-2 text-right font-semibold">Interval</th>
            <th className="py-2.5 px-2 text-right font-semibold">Last</th>
            <th className="py-2.5 px-2 text-right font-semibold">Best</th>
            <th className="py-2.5 px-2 text-center font-semibold hidden lg:table-cell">
              S1 / S2 / S3
            </th>
            <th className="py-2.5 px-2 text-center font-semibold">Tyre</th>
            <th className="py-2.5 pr-3 px-2 text-center font-semibold">Pits</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const dr = driverById(r.driverId);
            const team = dr ? constructorById(dr.teamId) : undefined;
            const selected = selectedDriverId === r.driverId;
            if (!dr) return null;
            return (
              <tr
                key={r.driverId}
                onClick={() => onSelect(r.driverId)}
                className={`cursor-pointer border-b border-border/40 transition-colors ${
                  selected ? "row-selected" : "hover:bg-accent/60"
                }`}
              >
                <td className="py-2.5 pl-3 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-4 w-1 rounded-full"
                      style={{ backgroundColor: team?.color }}
                    />
                    <span
                      className={`timing-cell font-semibold ${r.retired ? "text-muted-foreground/50" : ""}`}
                    >
                      {r.retired ? "DNF" : r.position}
                    </span>
                  </div>
                </td>
                <td className="timing-cell px-2 text-muted-foreground">
                  {dr.number}
                </td>
                <td className="px-2">
                  <span
                    className={`text-[13px] font-semibold ${r.retired ? "text-muted-foreground/60" : ""}`}
                  >
                    {dr.abbreviation}
                    <span className="ml-2 hidden font-normal text-muted-foreground md:inline">
                      {dr.name}
                    </span>
                  </span>
                </td>
                <td className="px-2 hidden md:table-cell">
                  <span className="text-[13px] text-muted-foreground">
                    {team?.name}
                  </span>
                </td>
                <td className="timing-cell px-2 text-right text-muted-foreground">
                  {r.retired || r.lapNumber === null ? "—" : r.lapNumber}
                </td>
                <td className="timing-cell px-2 text-right">
                  {r.gapToLeader ?? "—"}
                </td>
                <td className="timing-cell px-2 text-right text-muted-foreground">
                  {r.interval ?? "—"}
                </td>
                <td className="timing-cell px-2 text-right">
                  {r.lastLap ?? "—"}
                </td>
                <td className="timing-cell px-2 text-right text-signal-purple">
                  {r.bestLap ?? "—"}
                </td>
                <td className="timing-cell px-2 text-center hidden lg:table-cell text-muted-foreground">
                  {r.retired ? "— — —" : r.sectors.join(" / ")}
                </td>
                <td className="px-2 text-center">
                  {r.compound ? (
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 text-[9px] font-bold"
                      style={{
                        borderColor: compoundColor(r.compound),
                        color: compoundColor(r.compound),
                      }}
                      title={`${r.compound}${r.tyreAge ? ` · age ${r.tyreAge} laps` : ""}`}
                    >
                      {r.compound}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="timing-cell pr-3 px-2 text-center text-muted-foreground">
                  {r.inPit ? (
                    <span className="text-signal-amber font-semibold">PIT</span>
                  ) : (
                    r.pitCount
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
