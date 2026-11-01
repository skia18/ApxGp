import type { Circuit } from "./types";

// Stylised circuit outlines drawn for this platform (viewBox 0 0 100 100).
// Used by the Race Centre circuit view until positional telemetry is integrated.
export const circuits: Circuit[] = [
  {
    id: "rodriguez",
    name: "Autódromo Hermanos Rodríguez",
    locality: "Mexico City",
    country: "Mexico",
    lengthKm: 4.304,
    turns: 17,
    firstGrandPrix: 1962,
    lapRecord: "1:15.284 — V. Bottas (2018)",
    svgPath:
      "M18 30 L60 30 Q66 30 66 36 L66 44 Q66 50 60 50 L30 50 Q24 50 24 56 L24 68 Q24 74 18 74 L14 74 Q10 74 10 68 L10 36 Q10 30 18 30 Z",
    turnMarkers: [
      { n: 1, x: 60, y: 30 }, { n: 4, x: 66, y: 46 }, { n: 8, x: 30, y: 50 },
      { n: 12, x: 24, y: 68 }, { n: 17, x: 14, y: 74 },
    ],
    sectors: [0.4, 0.27, 0.33],
  },
  {
    id: "interlagos",
    name: "Autódromo José Carlos Pace",
    locality: "São Paulo",
    country: "Brazil",
    lengthKm: 4.309,
    turns: 15,
    firstGrandPrix: 1973,
    lapRecord: "1:10.540 — V. Bottas (2018)",
    svgPath:
      "M20 26 L58 26 Q64 26 64 32 L64 40 L72 40 Q78 40 78 46 L78 60 Q78 66 72 66 L34 66 Q28 66 28 60 L28 52 Q28 46 22 46 L16 46 Q10 46 10 40 L10 32 Q10 26 20 26 Z",
    turnMarkers: [
      { n: 1, x: 58, y: 26 }, { n: 4, x: 72, y: 40 }, { n: 8, x: 78, y: 58 },
      { n: 12, x: 28, y: 58 }, { n: 15, x: 10, y: 40 },
    ],
    sectors: [0.35, 0.3, 0.35],
  },
  {
    id: "vegas",
    name: "Las Vegas Strip Circuit",
    locality: "Las Vegas",
    country: "United States",
    lengthKm: 6.201,
    turns: 17,
    firstGrandPrix: 2023,
    lapRecord: "1:19.334 — R. Kari (2023)",
    svgPath:
      "M14 24 L74 24 Q82 24 82 32 L82 48 L70 48 L70 66 L56 66 L56 56 L28 56 L28 70 L20 70 Q12 70 12 62 L12 32 Q12 24 14 24 Z",
    turnMarkers: [
      { n: 1, x: 74, y: 24 }, { n: 5, x: 82, y: 48 }, { n: 9, x: 70, y: 60 },
      { n: 12, x: 56, y: 56 }, { n: 17, x: 12, y: 60 },
    ],
    sectors: [0.3, 0.4, 0.3],
  },
  {
    id: "yas-marina",
    name: "Yas Marina Circuit",
    locality: "Abu Dhabi",
    country: "United Arab Emirates",
    lengthKm: 5.281,
    turns: 16,
    firstGrandPrix: 2009,
    lapRecord: "1:22.109 — M. Verstappen (2021)",
    svgPath:
      "M16 30 Q16 22 26 22 L70 22 Q80 22 80 32 L80 44 Q80 50 74 52 L60 56 Q54 58 54 64 L54 70 Q54 76 46 76 L30 76 Q20 76 20 66 L20 50 Q20 44 16 40 Z",
    turnMarkers: [
      { n: 1, x: 70, y: 22 }, { n: 5, x: 80, y: 42 }, { n: 9, x: 60, y: 56 },
      { n: 13, x: 54, y: 70 }, { n: 16, x: 20, y: 62 },
    ],
    sectors: [0.32, 0.34, 0.34],
  },
  {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    locality: "Monza",
    country: "Italy",
    lengthKm: 5.793,
    turns: 11,
    firstGrandPrix: 1922,
    lapRecord: "1:19.119 — R. Kari (2023)",
    svgPath:
      "M18 24 L74 24 Q82 24 82 32 L82 40 L68 40 L68 58 L76 58 Q82 58 82 64 L82 70 Q82 76 74 76 L26 76 Q18 76 18 68 L18 44 L12 40 Q10 32 18 24 Z",
    turnMarkers: [
      { n: 1, x: 74, y: 24 }, { n: 4, x: 68, y: 50 }, { n: 7, x: 78, y: 62 },
      { n: 11, x: 18, y: 50 },
    ],
    sectors: [0.36, 0.28, 0.36],
  },
  {
    id: "monaco",
    name: "Circuit de Monaco",
    locality: "Monte Carlo",
    country: "Monaco",
    lengthKm: 3.337,
    turns: 19,
    firstGrandPrix: 1950,
    lapRecord: "1:12.909 — L. Hamilton (2021)",
    svgPath:
      "M20 26 L64 26 Q70 26 70 32 L70 40 Q70 46 64 46 L46 46 Q40 46 40 52 L40 60 Q40 66 34 66 L24 66 Q18 66 18 60 L18 32 Q18 26 20 26 Z",
    turnMarkers: [
      { n: 1, x: 62, y: 26 }, { n: 6, x: 46, y: 46 }, { n: 10, x: 40, y: 58 },
      { n: 19, x: 18, y: 56 },
    ],
    sectors: [0.34, 0.33, 0.33],
  },
  {
    id: "silverstone",
    name: "Silverstone Circuit",
    locality: "Silverstone",
    country: "United Kingdom",
    lengthKm: 5.891,
    turns: 18,
    firstGrandPrix: 1948,
    lapRecord: "1:27.097 — M. Verstappen (2020)",
    svgPath:
      "M16 32 Q16 24 26 24 L60 24 Q68 24 68 32 L68 40 L78 40 Q86 40 86 48 L86 62 Q86 70 78 70 L46 70 Q38 70 38 62 L38 54 L26 54 Q16 54 16 44 Z",
    turnMarkers: [
      { n: 1, x: 58, y: 24 }, { n: 8, x: 84, y: 50 }, { n: 13, x: 46, y: 70 },
      { n: 18, x: 16, y: 48 },
    ],
    sectors: [0.38, 0.28, 0.34],
  },
];

export const circuitById = (id: string): Circuit | undefined =>
  circuits.find((c) => c.id === id);

export const SECTOR_COLORS = ["#e10600", "#7c8797", "#4d8f3a"];
