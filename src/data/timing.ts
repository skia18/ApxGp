import type { TimingRow, StrategyData, SessionState } from "./types";
import { drivers } from "./drivers";

// SAMPLE TIMING DATA — clearly labelled in the UI. This is illustrative,
// NOT live or real telemetry. Pending a genuine data feed integration.

const COMPOUND_LAP: Record<string, number> = { S: 0, M: 1.6, H: 3.1 };

export const sampleSession = {
  state: "live" as SessionState,
  sessionName: "Grand Prix",
  lapNumber: 34,
  totalLaps: 71,
  weather: { track: 41, air: 26, condition: "Clear" },
  // A demo control so every session state can be inspected honestly.
  states: ["upcoming", "live", "suspended", "finished", "delayed", "unavailable"] as SessionState[],
};

// Deterministic pseudo-random generator so SSR and client render match.
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const buildRows = (): TimingRow[] =>
  drivers.map((dr, i) => {
    const r = (k: number) => rand(i * 7 + k);
    const retired = r(1) > 0.93;
    const base = 78 + r(2) * 2.2 + (i < 10 ? 0 : 0.9);
    const compound = (["S", "M", "H"] as const)[Math.floor(r(3) * 3)] ?? "M";
    const fmt = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s - m * 60;
      return `${m}:${sec.toFixed(3).padStart(6, "0")}`;
    };
    const last = base + (r(4) - 0.5) * 1.4;
    const best = base - 0.35 - r(5) * 0.5;
    const gap = i === 0 ? null : (i * 3.2 + r(6) * 2).toFixed(3);
    return {
      position: i + 1,
      driverId: dr.id,
      lapNumber: retired ? null : 20 + Math.floor(r(7) * 14),
      gapToLeader: retired ? null : gap ? `+${gap}` : "Leader",
      interval:
        retired || i === 0
          ? null
          : `+${(r(8) * 1.8 + 0.4).toFixed(3)}`,
      lastLap: retired ? null : fmt(last + (COMPOUND_LAP[compound] ?? 0)),
      bestLap: retired ? null : fmt(best + (COMPOUND_LAP[compound] ?? 0)),
      sectors: [
        fmt(base * 0.33 + r(9) * 0.2),
        fmt(base * 0.31 + r(10) * 0.2),
        fmt(base * 0.36 + r(11) * 0.2),
      ],
      compound: retired ? null : compound,
      tyreAge: retired ? null : 4 + Math.floor(r(12) * 18),
      pitCount: Math.floor(r(13) * 2),
      inPit: r(14) > 0.93,
      retired,
    };
  });

export const sampleTimingRows = (): TimingRow[] => buildRows();

const buildStrategy = (): StrategyData[] =>
  drivers.map((dr, i) => {
    const r = (k: number) => rand(i * 13 + k);
    const base = 78 + r(1) * 2.2 + (i < 10 ? 0 : 0.9);
    const lapTimes: { lap: number; seconds: number }[] = [];
    for (let lap = 1; lap <= 33; lap++) {
      const deg = 0.018 * lap * (1 + r(2) * 0.4);
      const noise = (r(lap + 50) - 0.5) * 0.9;
      lapTimes.push({ lap, seconds: +(base + deg + noise).toFixed(3) });
    }
    const stints = [
      { compound: "M" as const, startLap: 1, endLap: 14 + Math.floor(r(3) * 4) },
      { compound: "H" as const, startLap: 15 + Math.floor(r(3) * 4), endLap: 33 },
    ];
    const pitLaps = [stints[0]!.endLap + 1];
    const positionByLap: { lap: number; position: number }[] = [];
    for (let lap = 1; lap <= 33; lap++) {
      const drift = Math.floor(r(lap + 90) * 4) - 1;
      positionByLap.push({
        lap,
        position: Math.max(1, Math.min(20, i + 1 + (lap > 15 ? drift : 0))),
      });
    }
    return { driverId: dr.id, lapTimes, stints, pitLaps, positionByLap };
  });

export const sampleStrategy = (): StrategyData[] => buildStrategy();

export const strategyNotes = [
  {
    title: "Undercut",
    body: "Pitting earlier than a rival so the fresh tyres produce fast laps while they are stuck on old rubber — building enough of a gap to rejoin ahead.",
  },
  {
    title: "Overcut",
    body: "Staying out longer than a rival on fresh tyres, relying on pace in clean air to rejoin ahead anyway. Rarer, works when traffic or warm-up slows the early pitter.",
  },
  {
    title: "Tyre degradation",
    body: "Every lap the tyres lose grip (the upward trend in lap times). Managing the slope — pace, driving style, track temperature — decides how many stops a race needs.",
  },
  {
    title: "Underlying pace vs track position",
    body: "Fast lap times in traffic mean little without track position. Position-change charts show whether a car is genuinely faster or just running cleaner air.",
  },
];
