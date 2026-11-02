import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DriverStrategy } from "@/api/client";
import { strategyNotes } from "@/data/timing";

const secondsToLap = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds - minutes * 60).toFixed(3).padStart(6, "0")}`;
};

export function LapProgressionChart({
  primary,
  secondary,
}: {
  primary: DriverStrategy;
  secondary?: DriverStrategy;
}) {
  const laps = new Map<
    number,
    { lap: number; primary?: number; secondary?: number }
  >();
  for (const item of primary.laps.filter((lap) => !lap.isPitOutLap)) {
    laps.set(item.lapNumber, { lap: item.lapNumber, primary: item.duration });
  }
  for (const item of secondary?.laps.filter((lap) => !lap.isPitOutLap) ?? []) {
    const row = laps.get(item.lapNumber) ?? { lap: item.lapNumber };
    row.secondary = item.duration;
    laps.set(item.lapNumber, row);
  }
  const chartData = [...laps.values()].sort((a, b) => a.lap - b.lap);

  return (
    <div className="panel p-5">
      <h3 className="headline text-sm">Lap-time progression</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Timed laps from OpenF1 · pit-out laps excluded
      </p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
            <XAxis
              dataKey="lap"
              tick={{ fill: "#8a8f99", fontSize: 11 }}
              stroke="rgba(255,255,255,0.15)"
              label={{
                value: "Lap",
                position: "insideBottomRight",
                offset: -2,
                fill: "#8a8f99",
                fontSize: 10,
              }}
            />
            <YAxis
              domain={["dataMin - 1", "dataMax + 1"]}
              tick={{ fill: "#8a8f99", fontSize: 11 }}
              stroke="rgba(255,255,255,0.15)"
              tickFormatter={(value: number) => value.toFixed(0)}
            />
            <Tooltip
              contentStyle={{
                background: "#15161a",
                border: "1px solid #3a3d44",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(label) => `Lap ${label}`}
              formatter={(value: number, name: string) => [
                secondsToLap(value),
                name,
              ]}
            />
            <Line
              type="monotone"
              dataKey="primary"
              name={primary.driverCode}
              stroke={`#${primary.teamColour || "E10600"}`}
              connectNulls
              dot={false}
              strokeWidth={2}
            />
            {secondary && (
              <Line
                type="monotone"
                dataKey="secondary"
                name={secondary.driverCode}
                stroke="#8a8f99"
                connectNulls
                dot={false}
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const compoundColor: Record<string, string> = {
  SOFT: "#FF4554",
  MEDIUM: "#FFD12E",
  HARD: "#EBEBEB",
  INTERMEDIATE: "#43CD4A",
  WET: "#3B7FDB",
  UNKNOWN: "#8A8F99",
};

export function StintPanel({ strategy }: { strategy: DriverStrategy }) {
  const lastLap = Math.max(
    1,
    ...strategy.laps.map((lap) => lap.lapNumber),
    ...strategy.stints.map((stint) => stint.endLap),
  );

  return (
    <div className="panel p-5">
      <h3 className="headline text-sm">Tyre stints & pit stops</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Recorded compounds and stops for {strategy.driverCode}
      </p>
      {strategy.stints.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          No stint data was published for this driver and session.
        </p>
      ) : (
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Lap 1</span>
            <span>Lap {lastLap}</span>
          </div>
          <div className="relative h-8 w-full overflow-hidden rounded-md border border-border bg-secondary/40">
            {strategy.stints.map((stint) => {
              const color = compoundColor[stint.compound] ?? "#8A8F99";
              const left = ((stint.startLap - 1) / lastLap) * 100;
              const width =
                ((stint.endLap - stint.startLap + 1) / lastLap) * 100;
              return (
                <div
                  key={stint.number}
                  className="absolute inset-y-0 flex items-center justify-center border-r border-black/40 text-[10px] font-bold"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: `${color}26`,
                    color,
                  }}
                  title={`${stint.compound} · laps ${stint.startLap}–${stint.endLap} · tyre age ${stint.tyreAgeAtStart}`}
                >
                  {stint.compound.slice(0, 1)}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {strategy.stints.map((stint) => (
              <span
                key={stint.number}
                className="rounded-sm border border-border bg-secondary px-2.5 py-1 text-xs"
              >
                {stint.compound} · L{stint.startLap}–{stint.endLap}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="mt-5 border-t border-border pt-4">
        <h4 className="eyebrow text-[10px] text-muted-foreground">Pit stops</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {strategy.pitStops.length === 0 && (
            <span className="text-xs text-muted-foreground">None recorded</span>
          )}
          {strategy.pitStops.map((stop, index) => (
            <span
              key={`${stop.lapNumber}-${index}`}
              className="rounded-sm border border-border bg-secondary px-2.5 py-1 tabular text-xs"
            >
              Lap {stop.lapNumber}
              {stop.stopDuration != null
                ? ` · ${stop.stopDuration.toFixed(1)}s stop`
                : stop.laneDuration != null
                  ? ` · ${stop.laneDuration.toFixed(1)}s lane`
                  : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PaceSummaryPanel({ strategy }: { strategy: DriverStrategy }) {
  const timedLaps = strategy.laps.filter((lap) => !lap.isPitOutLap);
  const fastest =
    timedLaps.length > 0
      ? Math.min(...timedLaps.map((lap) => lap.duration))
      : undefined;
  const average =
    timedLaps.length > 0
      ? timedLaps.reduce((sum, lap) => sum + lap.duration, 0) / timedLaps.length
      : undefined;

  return (
    <div className="panel p-5">
      <h3 className="headline text-sm">Pace summary</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Raw timed laps; pit-out laps excluded
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Stat label="Timed laps" value={String(timedLaps.length)} />
        <Stat label="Fastest" value={fastest ? secondsToLap(fastest) : "—"} />
        <Stat label="Average" value={average ? secondsToLap(average) : "—"} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/60 p-3">
      <p className="eyebrow text-[9px] text-muted-foreground">{label}</p>
      <p className="mt-1.5 tabular text-sm font-semibold sm:text-lg">{value}</p>
    </div>
  );
}

export function StrategyNotes() {
  return (
    <div className="panel p-5">
      <h3 className="headline text-sm">How to read this</h3>
      <dl className="mt-4 space-y-4">
        {strategyNotes.map((note) => (
          <div key={note.title}>
            <dt className="text-sm font-semibold">{note.title}</dt>
            <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {note.body}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
