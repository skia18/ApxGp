// History & Records content — modern-season focus with an extensible structure.

export interface ChampionEntry {
  season: number;
  driverId: string;
  driverName: string;
  constructorId: string;
  constructorName: string;
  wins: number;
  points: number;
  note?: string;
}

export interface SeasonRecord {
  season: number;
  races: number;
  driverChampionId: string;
  constructorChampionId: string;
}

export const seasonRecords: SeasonRecord[] = [
  {
    season: 2026,
    races: 23,
    driverChampionId: "tbd",
    constructorChampionId: "tbd",
  },
  {
    season: 2025,
    races: 24,
    driverChampionId: "piastri",
    constructorChampionId: "mclaren",
  },
  {
    season: 2024,
    races: 24,
    driverChampionId: "verstappen",
    constructorChampionId: "mclaren",
  },
  {
    season: 2023,
    races: 22,
    driverChampionId: "verstappen",
    constructorChampionId: "red-bull",
  },
  {
    season: 2022,
    races: 22,
    driverChampionId: "verstappen",
    constructorChampionId: "red-bull",
  },
  {
    season: 2021,
    races: 22,
    driverChampionId: "verstappen",
    constructorChampionId: "mercedes",
  },
  {
    season: 2020,
    races: 17,
    driverChampionId: "hamilton",
    constructorChampionId: "mercedes",
  },
  {
    season: 2019,
    races: 21,
    driverChampionId: "hamilton",
    constructorChampionId: "mercedes",
  },
  {
    season: 2018,
    races: 21,
    driverChampionId: "hamilton",
    constructorChampionId: "mercedes",
  },
  {
    season: 2017,
    races: 20,
    driverChampionId: "hamilton",
    constructorChampionId: "mercedes",
  },
  {
    season: 2016,
    races: 21,
    driverChampionId: "rosberg",
    constructorChampionId: "mercedes",
  },
  {
    season: 2015,
    races: 19,
    driverChampionId: "hamilton",
    constructorChampionId: "mercedes",
  },
  {
    season: 2014,
    races: 19,
    driverChampionId: "hamilton",
    constructorChampionId: "mercedes",
  },
  {
    season: 2013,
    races: 19,
    driverChampionId: "vettel",
    constructorChampionId: "red-bull",
  },
  {
    season: 2012,
    races: 20,
    driverChampionId: "vettel",
    constructorChampionId: "red-bull",
  },
  {
    season: 2011,
    races: 19,
    driverChampionId: "vettel",
    constructorChampionId: "red-bull",
  },
  {
    season: 2010,
    races: 19,
    driverChampionId: "vettel",
    constructorChampionId: "red-bull",
  },
];

export const champions: ChampionEntry[] = [
  {
    season: 2025,
    driverId: "piastri",
    driverName: "Oscar Piastri",
    constructorId: "mclaren",
    constructorName: "McLaren",
    wins: 14,
    points: 442,
    note: "McLaren's first drivers' crown since 2008.",
  },
  {
    season: 2024,
    driverId: "verstappen",
    driverName: "Max Verstappen",
    constructorId: "red-bull",
    constructorName: "Red Bull",
    wins: 9,
    points: 437,
    note: "A fourth consecutive title won with a car that was no longer the fastest.",
  },
  {
    season: 2023,
    driverId: "verstappen",
    driverName: "Max Verstappen",
    constructorId: "red-bull",
    constructorName: "Red Bull",
    wins: 19,
    points: 575,
    note: "A record 19 wins from 22 rounds and 10 wins in a row.",
  },
  {
    season: 2022,
    driverId: "verstappen",
    driverName: "Max Verstappen",
    constructorId: "red-bull",
    constructorName: "Red Bull",
    wins: 15,
    points: 454,
    note: "Record points haul under the new ground-effect rules.",
  },
  {
    season: 2021,
    driverId: "verstappen",
    driverName: "Max Verstappen",
    constructorId: "red-bull",
    constructorName: "Red Bull",
    wins: 10,
    points: 395.5,
    note: "Decided on the final lap of the final race in Abu Dhabi.",
  },
  {
    season: 2020,
    driverId: "hamilton",
    driverName: "Lewis Hamilton",
    constructorId: "mercedes",
    constructorName: "Mercedes",
    wins: 11,
    points: 347,
    note: "Equaled Schumacher's seven titles in a compressed season.",
  },
  {
    season: 2019,
    driverId: "hamilton",
    driverName: "Lewis Hamilton",
    constructorId: "mercedes",
    constructorName: "Mercedes",
    wins: 11,
    points: 413,
  },
  {
    season: 2018,
    driverId: "hamilton",
    driverName: "Lewis Hamilton",
    constructorId: "mercedes",
    constructorName: "Mercedes",
    wins: 11,
    points: 408,
  },
  {
    season: 2017,
    driverId: "hamilton",
    driverName: "Lewis Hamilton",
    constructorId: "mercedes",
    constructorName: "Mercedes",
    wins: 9,
    points: 363,
  },
  {
    season: 2016,
    driverId: "rosberg",
    driverName: "Nico Rosberg",
    constructorId: "mercedes",
    constructorName: "Mercedes",
    wins: 9,
    points: 385,
    note: "Retired five days after winning the title.",
  },
  {
    season: 2015,
    driverId: "hamilton",
    driverName: "Lewis Hamilton",
    constructorId: "mercedes",
    constructorName: "Mercedes",
    wins: 10,
    points: 381,
  },
  {
    season: 2014,
    driverId: "hamilton",
    driverName: "Lewis Hamilton",
    constructorId: "mercedes",
    constructorName: "Mercedes",
    wins: 11,
    points: 384,
    note: "First year of the hybrid era.",
  },
  {
    season: 2013,
    driverId: "vettel",
    driverName: "Sebastian Vettel",
    constructorId: "red-bull",
    constructorName: "Red Bull",
    wins: 13,
    points: 397,
    note: "Nine consecutive wins to close the year.",
  },
  {
    season: 2012,
    driverId: "vettel",
    driverName: "Sebastian Vettel",
    constructorId: "red-bull",
    constructorName: "Red Bull",
    wins: 5,
    points: 281,
  },
  {
    season: 2011,
    driverId: "vettel",
    driverName: "Sebastian Vettel",
    constructorId: "red-bull",
    constructorName: "Red Bull",
    wins: 11,
    points: 392,
  },
  {
    season: 2010,
    driverId: "vettel",
    driverName: "Sebastian Vettel",
    constructorId: "red-bull",
    constructorName: "Red Bull",
    wins: 5,
    points: 256,
    note: "Youngest champion at the time; five-way fight to the wire.",
  },
];

export const records = [
  {
    label: "Most world titles (driver)",
    value: "7 — Michael Schumacher & Lewis Hamilton",
  },
  { label: "Most wins (driver)", value: "105 — Lewis Hamilton" },
  { label: "Most pole positions", value: "104 — Lewis Hamilton" },
  { label: "Most podiums", value: "205 — Lewis Hamilton" },
  { label: "Most constructors' titles", value: "16 — Ferrari" },
  { label: "Most wins (constructor)", value: "249 — Ferrari" },
  { label: "Most wins in a season", value: "19 — Max Verstappen (2023)" },
  { label: "Most points in a season", value: "575 — Max Verstappen (2023)" },
  { label: "Youngest champion", value: "23y 133d — Sebastian Vettel (2010)" },
  { label: "Most consecutive wins", value: "10 — Max Verstappen (2023)" },
];

export interface IconicRace {
  id: string;
  season: number;
  race: string;
  circuit: string;
  headline: string;
  story: string;
}

export const iconicRaces: IconicRace[] = [
  {
    id: "abu-dhabi-2021",
    season: 2021,
    race: "Abu Dhabi Grand Prix",
    circuit: "Yas Marina",
    headline: "Decided on the last lap of the last race",
    story:
      "A late safety car and a single-lap shootout handed Verstappen his first title by overturning a 16-second gap deficit against Hamilton.",
  },
  {
    id: "brazil-2021",
    season: 2021,
    race: "São Paulo Grand Prix",
    circuit: "Interlagos",
    headline: "P10 to P1, twice in a weekend",
    story:
      "Hamilton disqualified from qualifying, fought through the sprint from the back, then won the Grand Prix from tenth with a Red Bull-free podium.",
  },
  {
    id: "monza-2020",
    season: 2020,
    race: "Italian Grand Prix",
    circuit: "Monza",
    headline: "Gasly's shock win",
    story:
      "A red flag and a safety car reshuffled everything; Pierre Gasly delivered his and AlphaTauri's first win ahead of Sainz and Racing Point.",
  },
  {
    id: "brazil-2008",
    season: 2008,
    race: "Brazilian Grand Prix",
    circuit: "Interlagos",
    headline: "Five corners from the title",
    story:
      "Hamilton needed a top-five finish and lost it on the penultimate lap — before Vettel passed Glock on the last corner to take it back.",
  },
];
