import type { Race } from "./types";

// SAMPLE CALENDAR — 2026 illustration pending a real data integration.
// Race dates/times are configured event timestamps, used by the live countdown.
export const season = 2026;

const sessions = (raceIso: string, off: Record<string, number>) =>
  Object.entries(off).map(([name, hours]) => ({
    name,
    dateIso: new Date(
      new Date(raceIso).getTime() - hours * 3600 * 1000,
    ).toISOString(),
  }));

// Remaining 2026 rounds. Earlier rounds are marked completed with sample winners.
export const calendar: Race[] = [
  {
    id: "australia",
    round: 1,
    name: "Australian Grand Prix",
    country: "Australia",
    countryCode: "AUS",
    location: "Melbourne",
    circuitId: "albert-park",
    raceDateIso: "2026-03-08T15:00:00+11:00",
    sessions: sessions("2026-03-08T15:00:00+11:00", {
      Qualifying: 26,
      "Practice 2": 44,
      "Practice 1": 68,
    }),
    status: "completed",
    sampleWinner: "piastri",
  },
  {
    id: "china",
    round: 2,
    name: "Chinese Grand Prix",
    country: "China",
    countryCode: "CHN",
    location: "Shanghai",
    circuitId: "shanghai",
    raceDateIso: "2026-03-22T15:00:00+08:00",
    sessions: sessions("2026-03-22T15:00:00+08:00", {
      Qualifying: 22,
      "Practice 1": 48,
    }),
    status: "completed",
    sampleWinner: "piastri",
  },
  {
    id: "japan",
    round: 3,
    name: "Japanese Grand Prix",
    country: "Japan",
    countryCode: "JPN",
    location: "Suzuka",
    circuitId: "suzuka",
    raceDateIso: "2026-04-05T14:00:00+09:00",
    sessions: sessions("2026-04-05T14:00:00+09:00", {
      Qualifying: 26,
      "Practice 2": 44,
      "Practice 1": 68,
    }),
    status: "completed",
    sampleWinner: "verstappen",
  },
  {
    id: "bahrain",
    round: 4,
    name: "Bahrain Grand Prix",
    country: "Bahrain",
    countryCode: "BHR",
    location: "Sakhir",
    circuitId: "bahrain",
    raceDateIso: "2026-04-12T18:00:00+03:00",
    sessions: sessions("2026-04-12T18:00:00+03:00", {
      Qualifying: 26,
      "Practice 2": 44,
      "Practice 1": 68,
    }),
    status: "completed",
    sampleWinner: "norris",
  },
  {
    id: "saudi-arabia",
    round: 5,
    name: "Saudi Arabian Grand Prix",
    country: "Saudi Arabia",
    countryCode: "SAU",
    location: "Jeddah",
    circuitId: "jeddah",
    raceDateIso: "2026-04-19T20:00:00+03:00",
    sessions: sessions("2026-04-19T20:00:00+03:00", {
      Qualifying: 26,
      "Practice 1": 44,
    }),
    status: "completed",
    sampleWinner: "piastri",
  },
  {
    id: "miami",
    round: 6,
    name: "Miami Grand Prix",
    country: "United States",
    countryCode: "USA",
    location: "Miami",
    circuitId: "miami",
    raceDateIso: "2026-05-03T15:30:00-04:00",
    sessions: sessions("2026-05-03T15:30:00-04:00", {
      Qualifying: 24,
      "Practice 1": 44,
    }),
    status: "completed",
    sampleWinner: "russell",
  },
  {
    id: "canada",
    round: 7,
    name: "Canadian Grand Prix",
    country: "Canada",
    countryCode: "CAN",
    location: "Montreal",
    circuitId: "villeneuve",
    raceDateIso: "2026-05-17T14:00:00-04:00",
    sessions: sessions("2026-05-17T14:00:00-04:00", {
      Qualifying: 26,
      "Practice 2": 44,
      "Practice 1": 68,
    }),
    status: "completed",
    sampleWinner: "norris",
  },
  {
    id: "monaco",
    round: 8,
    name: "Monaco Grand Prix",
    country: "Monaco",
    countryCode: "MON",
    location: "Monte Carlo",
    circuitId: "monaco",
    raceDateIso: "2026-05-24T15:00:00+02:00",
    sessions: sessions("2026-05-24T15:00:00+02:00", {
      Qualifying: 26,
      "Practice 1": 44,
    }),
    status: "completed",
    sampleWinner: "leclerc",
  },
  {
    id: "spain",
    round: 9,
    name: "Spanish Grand Prix",
    country: "Spain",
    countryCode: "ESP",
    location: "Barcelona",
    circuitId: "catalunya",
    raceDateIso: "2026-05-31T15:00:00+02:00",
    sessions: sessions("2026-05-31T15:00:00+02:00", {
      Qualifying: 26,
      "Practice 2": 44,
      "Practice 1": 68,
    }),
    status: "completed",
    sampleWinner: "piastri",
  },
  {
    id: "austria",
    round: 10,
    name: "Austrian Grand Prix",
    country: "Austria",
    countryCode: "AUT",
    location: "Spielberg",
    circuitId: "spielberg",
    raceDateIso: "2026-06-14T15:00:00+02:00",
    sessions: sessions("2026-06-14T15:00:00+02:00", {
      Qualifying: 26,
      "Practice 1": 44,
    }),
    status: "completed",
    sampleWinner: "verstappen",
  },
  {
    id: "britain",
    round: 11,
    name: "British Grand Prix",
    country: "United Kingdom",
    countryCode: "GBR",
    location: "Silverstone",
    circuitId: "silverstone",
    raceDateIso: "2026-06-28T15:00:00+01:00",
    sessions: sessions("2026-06-28T15:00:00+01:00", {
      Qualifying: 26,
      "Practice 2": 44,
      "Practice 1": 68,
    }),
    status: "completed",
    sampleWinner: "hamilton",
  },
  {
    id: "belgium",
    round: 12,
    name: "Belgian Grand Prix",
    country: "Belgium",
    countryCode: "BEL",
    location: "Spa-Francorchamps",
    circuitId: "spa",
    raceDateIso: "2026-07-05T15:00:00+02:00",
    sessions: sessions("2026-07-05T15:00:00+02:00", {
      Qualifying: 24,
      "Sprint Qualifying": 48,
      "Practice 1": 68,
    }),
    status: "completed",
    sampleWinner: "piastri",
  },
  {
    id: "hungary",
    round: 13,
    name: "Hungarian Grand Prix",
    country: "Hungary",
    countryCode: "HUN",
    location: "Budapest",
    circuitId: "hungaroring",
    raceDateIso: "2026-07-19T15:00:00+02:00",
    sessions: sessions("2026-07-19T15:00:00+02:00", {
      Qualifying: 26,
      "Practice 2": 44,
      "Practice 1": 68,
    }),
    status: "completed",
    sampleWinner: "norris",
  },
  {
    id: "netherlands",
    round: 14,
    name: "Dutch Grand Prix",
    country: "Netherlands",
    countryCode: "NED",
    location: "Zandvoort",
    circuitId: "zandvoort",
    raceDateIso: "2026-08-23T15:00:00+02:00",
    sessions: sessions("2026-08-23T15:00:00+02:00", {
      Qualifying: 26,
      "Practice 1": 44,
    }),
    status: "completed",
    sampleWinner: "verstappen",
  },
  {
    id: "italy",
    round: 15,
    name: "Italian Grand Prix",
    country: "Italy",
    countryCode: "ITA",
    location: "Monza",
    circuitId: "monza",
    raceDateIso: "2026-09-06T15:00:00+02:00",
    sessions: sessions("2026-09-06T15:00:00+02:00", {
      Qualifying: 26,
      "Practice 1": 44,
    }),
    status: "completed",
    sampleWinner: "leclerc",
  },
  {
    id: "azerbaijan",
    round: 16,
    name: "Azerbaijan Grand Prix",
    country: "Azerbaijan",
    countryCode: "AZE",
    location: "Baku",
    circuitId: "baku",
    raceDateIso: "2026-09-20T15:00:00+04:00",
    sessions: sessions("2026-09-20T15:00:00+04:00", {
      Qualifying: 26,
      "Practice 1": 44,
    }),
    status: "completed",
    sampleWinner: "russell",
  },
  {
    id: "singapore",
    round: 17,
    name: "Singapore Grand Prix",
    country: "Singapore",
    countryCode: "SGP",
    location: "Marina Bay",
    circuitId: "singapore",
    raceDateIso: "2026-10-04T20:00:00+08:00",
    sessions: sessions("2026-10-04T20:00:00+08:00", {
      Qualifying: 26,
      "Practice 2": 44,
      "Practice 1": 68,
    }),
    status: "completed",
    sampleWinner: "piastri",
  },
  {
    id: "united-states",
    round: 18,
    name: "United States Grand Prix",
    country: "United States",
    countryCode: "USA",
    location: "Austin",
    circuitId: "americas",
    raceDateIso: "2026-10-11T14:00:00-05:00",
    sessions: sessions("2026-10-11T14:00:00-05:00", {
      Qualifying: 24,
      Sprint: 0,
      "Practice 1": 68,
    }),
    status: "completed",
    sampleWinner: "verstappen",
  },
  {
    id: "mexico-city",
    round: 19,
    name: "Mexico City Grand Prix",
    country: "Mexico",
    countryCode: "MEX",
    location: "Mexico City",
    circuitId: "rodriguez",
    raceDateIso: "2026-10-25T15:00:00-06:00",
    sessions: sessions("2026-10-25T15:00:00-06:00", {
      Qualifying: 26,
      "Practice 2": 44,
      "Practice 1": 68,
    }),
    status: "upcoming",
  },
  {
    id: "brazil",
    round: 20,
    name: "São Paulo Grand Prix",
    country: "Brazil",
    countryCode: "BRA",
    location: "São Paulo",
    circuitId: "interlagos",
    raceDateIso: "2026-11-08T14:00:00-03:00",
    sessions: sessions("2026-11-08T14:00:00-03:00", {
      Qualifying: 24,
      "Sprint Qualifying": 48,
      "Practice 1": 68,
    }),
    status: "upcoming",
  },
  {
    id: "las-vegas",
    round: 21,
    name: "Las Vegas Grand Prix",
    country: "United States",
    countryCode: "USA",
    location: "Las Vegas",
    circuitId: "vegas",
    raceDateIso: "2026-11-21T22:00:00-08:00",
    sessions: sessions("2026-11-21T22:00:00-08:00", {
      Qualifying: 26,
      "Practice 2": 44,
      "Practice 1": 68,
    }),
    status: "upcoming",
  },
  {
    id: "qatar",
    round: 22,
    name: "Qatar Grand Prix",
    country: "Qatar",
    countryCode: "QAT",
    location: "Lusail",
    circuitId: "lusail",
    raceDateIso: "2026-11-29T19:00:00+03:00",
    sessions: sessions("2026-11-29T19:00:00+03:00", {
      Qualifying: 24,
      "Sprint Qualifying": 48,
      "Practice 1": 68,
    }),
    status: "upcoming",
  },
  {
    id: "abu-dhabi",
    round: 23,
    name: "Abu Dhabi Grand Prix",
    country: "United Arab Emirates",
    countryCode: "UAE",
    location: "Yas Island",
    circuitId: "yas-marina",
    raceDateIso: "2026-12-06T17:00:00+04:00",
    sessions: sessions("2026-12-06T17:00:00+04:00", {
      Qualifying: 26,
      "Practice 2": 44,
      "Practice 1": 68,
    }),
    status: "upcoming",
  },
];

export const upcomingRaces = (): Race[] =>
  calendar.filter((r) => new Date(r.raceDateIso).getTime() > Date.now());

export const nextRace = (): Race =>
  upcomingRaces().sort(
    (a, b) =>
      new Date(a.raceDateIso).getTime() - new Date(b.raceDateIso).getTime(),
  )[0] ?? calendar[calendar.length - 1]!;

/** Races still to come after a given race (for "calendar" listings). */
export const remainingAfter = (raceId: string): Race[] => {
  const idx = calendar.findIndex((r) => r.id === raceId);
  return calendar
    .slice(Math.max(idx, 0))
    .filter((r) => new Date(r.raceDateIso).getTime() > Date.now());
};

/** True while the race weekend is on (from first session to ~3h after race start). */
export const isRaceWeekendActive = (race: Race): boolean => {
  const start = new Date(
    race.sessions[race.sessions.length - 1]?.dateIso ?? race.raceDateIso,
  ).getTime();
  const end = new Date(race.raceDateIso).getTime() + 3.5 * 3600 * 1000;
  return Date.now() >= start && Date.now() <= end;
};
