// Shared types for Apex F1 sample data.
// All data in src/data is SAMPLE content, clearly labelled in the UI,
// pending a real data integration. Nothing here represents live data.

// Provider-backed historical constructors are open-ended. Runtime lookups
// still validate whether a constructor is present in the current catalogue.
export type ConstructorId = string;

export interface Constructor {
  id: ConstructorId;
  name: string;
  fullName: string;
  color: string; // team colour, used sparingly for identity chips
  base: string;
  engineSupplier: string;
  teamPrincipal: string;
  debutYear: number;
  constructorsTitles: number;
  firstTitleYear?: number;
  chassisDesignation: string;
  chassisVerified: boolean;
  shortHistory: string;
}

export interface Driver {
  id: string;
  name: string;
  abbreviation: string;
  number: number;
  nationality: string;
  countryCode: string;
  teamId: ConstructorId;
  debutYear: number;
  raceWins: number;
  podiums: number;
  polePositions: number;
  worldTitles: number;
  raceStarts: number;
  bio: string;
  seasonHistory: { season: number; teamId: ConstructorId }[];
}

export interface DriverStanding {
  driverId: string;
  points: number;
  wins: number;
  podiums: number;
}

export interface ConstructorStanding {
  teamId: ConstructorId;
  points: number;
  wins: number;
}

export interface Session {
  name: string;
  dateIso: string;
}

export interface Race {
  id: string;
  round: number;
  name: string;
  country: string;
  countryCode: string;
  location: string;
  circuitId: string;
  raceDateIso: string;
  sessions: Session[];
  status?: "completed" | "upcoming";
  sampleWinner?: string;
}

export interface Circuit {
  id: string;
  name: string;
  locality: string;
  country: string;
  lengthKm: number;
  turns: number;
  firstGrandPrix: number;
  lapRecord: string;
  // Stylised SVG outline (viewBox 0 0 100 100), drawn for this platform.
  svgPath: string;
  turnMarkers: { n: number; x: number; y: number }[];
  sectors: [number, number, number]; // share of path length, sums to 1
}

export interface CarComponent {
  id: string;
  name: string;
  plain: string; // plain-language explanation
  deep: string; // deeper technical explanation
}

export interface Car {
  id: string;
  teamId: ConstructorId;
  season: number;
  designation: string;
  designationVerified: boolean;
  image: "red" | "silver" | "orange";
  summary: string;
  specs: { label: string; value: string; verified: boolean }[];
  components: CarComponent[];
}

export type SessionState =
  "upcoming" | "live" | "suspended" | "finished" | "delayed" | "unavailable";

export interface TimingRow {
  position: number;
  driverId: string;
  lapNumber: number | null;
  gapToLeader: string | null;
  interval: string | null;
  lastLap: string | null;
  bestLap: string | null;
  sectors: [string | null, string | null, string | null];
  compound: "S" | "M" | "H" | "I" | "W" | null;
  tyreAge: number | null;
  pitCount: number;
  inPit: boolean;
  retired: boolean;
}

export interface Stint {
  compound: "S" | "M" | "H" | "I" | "W";
  startLap: number;
  endLap: number;
}

export interface StrategyData {
  driverId: string;
  lapTimes: { lap: number; seconds: number }[]; // null-safe: clean laps only
  stints: Stint[];
  pitLaps: number[];
  positionByLap: { lap: number; position: number }[];
}
