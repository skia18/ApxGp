import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { constructorById, } from "@/data/constructors";
import { driverById } from "@/data/drivers";
import { strategyNotes } from "@/data/timing";
import type { StrategyData, Car } from "@/data/types";

const secondsToLap = (s: number) => {
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(3)}`;
};

export function LapProgressionChart({
  selected,
  primary,
  secondary,
}: {
  selected: string;
  primary: StrategyData;
  secondary?: StrategyData;
}) {
  const primaryDriver = driverById(selected);
  const team = primaryDriver ? constructorById(primaryDriver.teamId) : undefined;
  const merged = primary.lapTimes.map((p) => {
    const q = secondary?.lapTimes.find((x) => x.lap === p.lap);
    return { lap: p.lap, primary: p.seconds, secondary: q?.seconds };
  });

  return (
    <div className="panel p-5">
      <h3 className="headline text-sm">Lap-time progression</h3>
      <p className="mt-1 text-xs text-muted-foreground">Sample data · seconds per lap, laps 1–33</p>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={merged} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
            <XAxis
              dataKey="lap"
              tick={{ fill: "#8a8f99", fontSize: 11 }}
              stroke="rgba(255,255,255,0.15)"
              label={{ value: "Lap", position: "insideBottomRight", offset: -2, fill: "#8a8f99", fontSize: 10 }}
            />
            <YAxis
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
              tick={{ fill: "#8a8f99", fontSize: 11 }}
              stroke="rgba(255,255,255,0.15)"
              tickFormatter={(v: number) => v.toFixed(0)}
              label={{ value: "Lap time (s)", angle: -90, position: "insideLeft", fill: "#8a8f99", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ background: "#15161a", border: "1px solid #3a3d44", borderRadius: 8, fontSize: 12 }}
              labelFormatter={(l) => `Lap ${l}`}
              formatter={(v: number, name: string) => [secondsToLap(v), name]}
            />
            <Line type="monotone" dataKey="primary" name={primaryDriver?.name ?? ""} stroke={team?.color ?? "#e10600"} dot={false} strokeWidth={2} />
            {secondary && (
              <Line type="monotone" dataKey="secondary" name={driverById(secondary.driverId)?.name ?? "Team-mate"} stroke="#8a8f99" dot={false} strokeWidth={1.4} strokeDasharray="4 3" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StintPanel({ strategy, car }: { strategy: StrategyData; car?: Car }) {
  const laps = 33;
  const compoundColor: Record<string, string> = { S: "#FF4554", M: "#FFD12E", H: "#EBEBEB", I: "#43CD4A", W: "#3B7FDB" };
  return (
    <div className="panel p-5">
      <h3 className="headline text-sm">Tyre stints & pit stops</h3>
      <p className="mt-1 text-xs text-muted-foreground">Sample strategy for one race distance segment</p>
      <div className="mt-5 space-y-4">
        <div>
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            <span>Lap 1</span><span>Lap {laps}</span>
          </div>
          <div className="flex h-7 w-full overflow-hidden rounded-md border border-border">
            {strategy.stints.map((stint, i) => {
              const width = ((stint.endLap - stint.startLap + 1) / laps) * 100;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center border-r border-black/40 text-[10px] font-bold"
                  style={{ width: `${width}%`, backgroundColor: `${compoundColor[stint.compound]}26`, color: compoundColor[stint.compound] }}
                  title={`${stint.compound} · laps ${stint.startLap}–${stint.endLap}`}
                >
                  {stint.compound}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h4 className="eyebrow text-[10px] text-muted-foreground">Pit stops</h4>
          <div className="mt-2 flex gap-2">
            {strategy.pitLaps.map((lap, i) => (
              <span key={i} className="rounded-sm border border-border bg-secondary px-2.5 py-1 tabular text-xs">
                Lap {lap}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PositionChangesPanel({ strategy }: { strategy: StrategyData }) {
  const start = strategy.positionByLap[0]?.position ?? 0;
  const end = strategy.positionByLap[strategy.positionByLap.length - 1]?.position ?? 0;
  const delta = start - end;
  return (
    <div className="panel p-5">
      <h3 className="headline text-sm">Position changes</h3>
      <p className="mt-1 text-xs text-muted-foreground">Net change across the sample segment</p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Stat label="Start" value={`P${start}`} />
        <Stat label="Now" value={`P${end}`} />
        <Stat label="Net" value={delta === 0 ? "—" : `${delta > 0 ? "+" : ""}${delta}`} {...(delta === 0 ? {} : { accent: delta > 0 ? "#43CD4A" : "#FF4554" })} />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/60 p-3">
      <p className="eyebrow text-[9px] text-muted-foreground">{label}</p>
      <p className="mt-1.5 tabular text-xl font-semibold" style={accent ? { color: accent } : undefined}>{value}</p>
    </div>
  );
}

export function StrategyNotes() {
  return (
    <div className="panel p-5">
      <h3 className="headline text-sm">How to read this</h3>
      <dl className="mt-4 space-y-4">
        {strategyNotes.map((n) => (
          <div key={n.title}>
            <dt className="text-sm font-semibold">{n.title}</dt>
            <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
