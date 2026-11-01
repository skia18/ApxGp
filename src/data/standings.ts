import type { DriverStanding, ConstructorStanding } from "./types";

// SAMPLE DATA — 2026 standings illustration pending a real data integration.
export const driverStandings: DriverStanding[] = [
  { driverId: "piastri", points: 392, wins: 9, podiums: 16 },
  { driverId: "norris", points: 361, wins: 7, podiums: 17 },
  { driverId: "verstappen", points: 340, wins: 8, podiums: 15 },
  { driverId: "russell", points: 298, wins: 2, podiums: 13 },
  { driverId: "leclerc", points: 271, wins: 2, podiums: 11 },
  { driverId: "hamilton", points: 233, wins: 1, podiums: 9 },
  { driverId: "antonelli", points: 198, wins: 0, podiums: 8 },
  { driverId: "lawson", points: 121, wins: 0, podiums: 3 },
  { driverId: "sainz", points: 110, wins: 0, podiums: 2 },
  { driverId: "albon", points: 87, wins: 0, podiums: 2 },
  { driverId: "hadjar", points: 74, wins: 0, podiums: 3 },
  { driverId: "tsunoda", points: 52, wins: 0, podiums: 1 },
  { driverId: "alonso", points: 47, wins: 0, podiums: 1 },
  { driverId: "ocon", points: 40, wins: 0, podiums: 0 },
  { driverId: "gasly", points: 35, wins: 0, podiums: 1 },
  { driverId: "stroll", points: 30, wins: 0, podiums: 0 },
  { driverId: "bearman", points: 28, wins: 0, podiums: 0 },
  { driverId: "colapinto", points: 21, wins: 0, podiums: 0 },
  { driverId: "hulkenberg", points: 19, wins: 0, podiums: 1 },
  { driverId: "bortoleto", points: 12, wins: 0, podiums: 0 },
];

export const constructorStandings: ConstructorStanding[] = [
  { teamId: "mclaren", points: 753, wins: 16 },
  { teamId: "ferrari", points: 504, wins: 3 },
  { teamId: "red-bull", points: 461, wins: 8 },
  { teamId: "mercedes", points: 496, wins: 2 },
  { teamId: "aston-martin", points: 77, wins: 0 },
  { teamId: "racing-bulls", points: 126, wins: 0 },
  { teamId: "williams", points: 197, wins: 0 },
  { teamId: "alpine", points: 56, wins: 0 },
  { teamId: "haas", points: 68, wins: 0 },
  { teamId: "audi", points: 31, wins: 0 },
].sort((a, b) => b.points - a.points);

export const driverStandingById = (id: string) =>
  driverStandings.find((s) => s.driverId === id);
