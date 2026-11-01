import type { Driver } from "./types";
import type { ConstructorId } from "./types";

// SAMPLE DATA — 2026 line-up illustration pending a real data integration.
const d = (
  id: string,
  name: string,
  abbreviation: string,
  number: number,
  nationality: string,
  countryCode: string,
  teamId: ConstructorId,
  debutYear: number,
  raceWins: number,
  podiums: number,
  polePositions: number,
  worldTitles: number,
  raceStarts: number,
  bio: string,
  seasonHistory: { season: number; teamId: ConstructorId }[],
): Driver => ({
  id,
  name,
  abbreviation,
  number,
  nationality,
  countryCode,
  teamId,
  debutYear,
  raceWins,
  podiums,
  polePositions,
  worldTitles,
  raceStarts,
  bio,
  seasonHistory,
});

export const drivers: Driver[] = [
  d("norris", "Lando Norris", "NOR", 4, "United Kingdom", "GB", "mclaren", 2017, 12, 41, 14, 1, 260,
    "McLaren junior product who grew with the team from backmarker fights to championship contention, known for raw one-lap pace.",
    [{ season: 2017, teamId: "mclaren" }, { season: 2018, teamId: "mclaren" }, { season: 2019, teamId: "mclaren" }, { season: 2020, teamId: "mclaren" }, { season: 2021, teamId: "mclaren" }, { season: 2022, teamId: "mclaren" }, { season: 2023, teamId: "mclaren" }, { season: 2024, teamId: "mclaren" }, { season: 2025, teamId: "mclaren" }, { season: 2026, teamId: "mclaren" }]),
  d("piastri", "Oscar Piastri", "PIA", 81, "Australia", "AU", "mclaren", 2023, 11, 32, 10, 0, 90,
    "Alpine academy graduate who switched to papaya, an unusually calm race craft that turns pole into controlled wins.",
    [{ season: 2023, teamId: "mclaren" }, { season: 2024, teamId: "mclaren" }, { season: 2025, teamId: "mclaren" }, { season: 2026, teamId: "mclaren" }]),
  d("verstappen", "Max Verstappen", "VER", 1, "Netherlands", "NL", "red-bull", 2015, 70, 128, 47, 4, 260,
    "Four-time world champion and the youngest race starter in F1 history; the reference point for raw speed this era.",
    [{ season: 2015, teamId: "red-bull" }, { season: 2016, teamId: "red-bull" }, { season: 2017, teamId: "red-bull" }, { season: 2018, teamId: "red-bull" }, { season: 2019, teamId: "red-bull" }, { season: 2020, teamId: "red-bull" }, { season: 2021, teamId: "red-bull" }, { season: 2022, teamId: "red-bull" }, { season: 2023, teamId: "red-bull" }, { season: 2024, teamId: "red-bull" }, { season: 2025, teamId: "red-bull" }, { season: 2026, teamId: "red-bull" }]),
  d("lawson", "Liam Lawson", "LAW", 30, "New Zealand", "NZ", "red-bull", 2023, 0, 4, 0, 0, 45,
    "Promoted from the Faenza squad to the senior team, tasked with holding the second seat against the sport's benchmark driver.",
    [{ season: 2023, teamId: "racing-bulls" }, { season: 2024, teamId: "racing-bulls" }, { season: 2025, teamId: "racing-bulls" }, { season: 2026, teamId: "red-bull" }]),
  d("russell", "George Russell", "RUS", 63, "United Kingdom", "GB", "mercedes", 2019, 5, 28, 8, 0, 190,
    "From Williams prodigy to Mercedes leader in waiting, precise and politically sharp around the paddock.",
    [{ season: 2019, teamId: "williams" }, { season: 2020, teamId: "williams" }, { season: 2021, teamId: "mercedes" }, { season: 2022, teamId: "mercedes" }, { season: 2023, teamId: "mercedes" }, { season: 2024, teamId: "mercedes" }, { season: 2025, teamId: "mercedes" }, { season: 2026, teamId: "mercedes" }]),
  d("antonelli", "Kimi Antonelli", "ANT", 12, "Italy", "IT", "mercedes", 2025, 0, 6, 1, 0, 60,
    "The Mercedes academy's long-groomed teenage signing, thrown straight into a front-running seat.",
    [{ season: 2025, teamId: "mercedes" }, { season: 2026, teamId: "mercedes" }]),
  d("leclerc", "Charles Leclerc", "LEC", 16, "Monaco", "MC", "ferrari", 2018, 10, 52, 28, 0, 210,
    "Ferrari's home-grown benchmark, a relentless qualifier with eight Monaco-inspired poles and a legion of tifosi.",
    [{ season: 2018, teamId: "sauber" }, { season: 2019, teamId: "ferrari" }, { season: 2020, teamId: "ferrari" }, { season: 2021, teamId: "ferrari" }, { season: 2022, teamId: "ferrari" }, { season: 2023, teamId: "ferrari" }, { season: 2024, teamId: "ferrari" }, { season: 2025, teamId: "ferrari" }, { season: 2026, teamId: "ferrari" }]),
  d("hamilton", "Lewis Hamilton", "HAM", 44, "United Kingdom", "GB", "ferrari", 2007, 105, 205, 104, 7, 420,
    "Seven-time world champion and the most successful driver in history, chasing an eighth title in scarlet.",
    [{ season: 2007, teamId: "mclaren" }, { season: 2008, teamId: "mclaren" }, { season: 2009, teamId: "mclaren" }, { season: 2010, teamId: "mclaren" }, { season: 2011, teamId: "mclaren" }, { season: 2012, teamId: "mclaren" }, { season: 2013, teamId: "mercedes" }, { season: 2014, teamId: "mercedes" }, { season: 2015, teamId: "mercedes" }, { season: 2016, teamId: "mercedes" }, { season: 2017, teamId: "mercedes" }, { season: 2018, teamId: "mercedes" }, { season: 2019, teamId: "mercedes" }, { season: 2020, teamId: "mercedes" }, { season: 2021, teamId: "mercedes" }, { season: 2022, teamId: "mercedes" }, { season: 2023, teamId: "mercedes" }, { season: 2024, teamId: "mercedes" }, { season: 2025, teamId: "ferrari" }, { season: 2026, teamId: "ferrari" }]),
  d("norris-placeholder", "", "", 0, "", "", "mclaren", 0, 0, 0, 0, 0, 0, "", []), // removed below
  d("alonso", "Fernando Alonso", "ALO", 14, "Spain", "ES", "aston-martin", 2001, 32, 106, 22, 2, 430,
    "Two-time champion racing in his third decade, still extracting qualifying laps no one else can find.",
    [{ season: 2001, teamId: "minardi" }, { season: 2003, teamId: "renault" }, { season: 2004, teamId: "renault" }, { season: 2005, teamId: "renault" }, { season: 2006, teamId: "renault" }, { season: 2007, teamId: "mclaren" }, { season: 2008, teamId: "renault" }, { season: 2009, teamId: "renault" }, { season: 2010, teamId: "ferrari" }, { season: 2011, teamId: "ferrari" }, { season: 2012, teamId: "ferrari" }, { season: 2013, teamId: "ferrari" }, { season: 2014, teamId: "ferrari" }, { season: 2015, teamId: "mclaren" }, { season: 2016, teamId: "mclaren" }, { season: 2017, teamId: "mclaren" }, { season: 2018, teamId: "mclaren" }, { season: 2021, teamId: "alpine" }, { season: 2022, teamId: "alpine" }, { season: 2023, teamId: "aston-martin" }, { season: 2024, teamId: "aston-martin" }, { season: 2025, teamId: "aston-martin" }, { season: 2026, teamId: "aston-martin" }]),
  d("stroll", "Lance Stroll", "STR", 18, "Canada", "CA", "aston-martin", 2017, 0, 3, 1, 0, 210,
    "Aston Martin's longest-serving current driver, with a rookie podium and a front-row start on the ledger.",
    [{ season: 2017, teamId: "williams" }, { season: 2018, teamId: "williams" }, { season: 2019, teamId: "racing-point" }, { season: 2020, teamId: "racing-point" }, { season: 2021, teamId: "aston-martin" }, { season: 2022, teamId: "aston-martin" }, { season: 2023, teamId: "aston-martin" }, { season: 2024, teamId: "aston-martin" }, { season: 2025, teamId: "aston-martin" }, { season: 2026, teamId: "aston-martin" }]),
  d("sainz", "Carlos Sainz", "SAI", 55, "Spain", "ES", "williams", 2015, 4, 31, 5, 0, 250,
    "A meticulous setup engineer of a driver, now leading Grove's rebuild after race-winning spells at two top teams.",
    [{ season: 2015, teamId: "red-bull" }, { season: 2016, teamId: "red-bull" }, { season: 2017, teamId: "renault" }, { season: 2018, teamId: "renault" }, { season: 2019, teamId: "mclaren" }, { season: 2020, teamId: "mclaren" }, { season: 2021, teamId: "ferrari" }, { season: 2022, teamId: "ferrari" }, { season: 2023, teamId: "ferrari" }, { season: 2024, teamId: "ferrari" }, { season: 2025, teamId: "williams" }, { season: 2026, teamId: "williams" }]),
  d("albon", "Alexander Albon", "ALB", 23, "Thailand", "TH", "williams", 2019, 0, 4, 0, 0, 180,
    "Rebuilt his career at Williams into one of the grid's most consistent points scorers.",
    [{ season: 2019, teamId: "red-bull" }, { season: 2020, teamId: "red-bull" }, { season: 2022, teamId: "williams" }, { season: 2023, teamId: "williams" }, { season: 2024, teamId: "williams" }, { season: 2025, teamId: "williams" }, { season: 2026, teamId: "williams" }]),
  d("gasly", "Pierre Gasly", "GAS", 10, "France", "FR", "alpine", 2017, 1, 12, 0, 0, 230,
    "A Monza winner and podium regular, now team leader at Enstone in the Mercedes-engine era.",
    [{ season: 2017, teamId: "red-bull" }, { season: 2018, teamId: "red-bull" }, { season: 2019, teamId: "red-bull" }, { season: 2020, teamId: "alpha-tauri" }, { season: 2021, teamId: "alpha-tauri" }, { season: 2022, teamId: "alpha-tauri" }, { season: 2023, teamId: "alpine" }, { season: 2024, teamId: "alpine" }, { season: 2025, teamId: "alpine" }, { season: 2026, teamId: "alpine" }]),
  d("colapinto", "Franco Colapinto", "COL", 43, "Argentina", "AR", "alpine", 2024, 0, 0, 0, 0, 40,
    "The Argentine who scored points on debut, earning a full-time seat after a season of substitutes.",
    [{ season: 2024, teamId: "williams" }, { season: 2025, teamId: "alpine" }, { season: 2026, teamId: "alpine" }]),
  d("tsunoda", "Yuki Tsunoda", "TSU", 22, "Japan", "JP", "racing-bulls", 2021, 0, 5, 0, 0, 160,
    "Now the Faenza squad's senior driver, raw pace tamed into sharp Q3 appearances.",
    [{ season: 2021, teamId: "alpha-tauri" }, { season: 2022, teamId: "alpha-tauri" }, { season: 2023, teamId: "alpha-tauri" }, { season: 2024, teamId: "alpha-tauri" }, { season: 2025, teamId: "racing-bulls" }, { season: 2026, teamId: "racing-bulls" }]),
  d("hadjar", "Isack Hadjar", "HAD", 6, "France", "FR", "racing-bulls", 2025, 0, 4, 0, 0, 40,
    "A podium on his rookie account and a reputation as the sharpest of the newest generation.",
    [{ season: 2025, teamId: "racing-bulls" }, { season: 2026, teamId: "racing-bulls" }]),
  d("ocon", "Esteban Ocon", "OCO", 31, "France", "FR", "haas", 2016, 1, 5, 0, 0, 220,
    "A Hungarian Grand Prix winner who has dragged every midfield car he has driven above its weight.",
    [{ season: 2016, teamId: "manor" }, { season: 2017, teamId: "force-india" }, { season: 2018, teamId: "force-india" }, { season: 2019, teamId: "racing-point" }, { season: 2020, teamId: "racing-point" }, { season: 2021, teamId: "alpine" }, { season: 2022, teamId: "alpine" }, { season: 2023, teamId: "alpine" }, { season: 2024, teamId: "alpine" }, { season: 2025, teamId: "haas" }, { season: 2026, teamId: "haas" }]),
  d("bearman", "Oliver Bearman", "BEA", 87, "United Kingdom", "GB", "haas", 2025, 0, 1, 0, 0, 45,
    "Scored points on his F1 debut as a Ferrari substitute at 18, now a full season into his Haas career.",
    [{ season: 2025, teamId: "haas" }, { season: 2026, teamId: "haas" }]),
  d("hulkenberg", "Nico Hülkenberg", "HUL", 27, "Germany", "DE", "audi", 2010, 0, 1, 0, 0, 280,
    "A 15-season veteran finally on the podium in 2025, now the senior figure in Audi's first works campaign.",
    [{ season: 2010, teamId: "williams" }, { season: 2011, teamId: "force-india" }, { season: 2012, teamId: "force-india" }, { season: 2013, teamId: "sauber" }, { season: 2014, teamId: "sauber" }, { season: 2015, teamId: "force-india" }, { season: 2016, teamId: "force-india" }, { season: 2017, teamId: "renault" }, { season: 2018, teamId: "renault" }, { season: 2019, teamId: "renault" }, { season: 2020, teamId: "racing-point" }, { season: 2021, teamId: "aston-martin" }, { season: 2022, teamId: "aston-martin" }, { season: 2023, teamId: "haas" }, { season: 2024, teamId: "haas" }, { season: 2025, teamId: "sauber" }, { season: 2026, teamId: "audi" }]),
  d("bortoleto", "Gabriel Bortoleto", "BOR", 5, "Brazil", "BR", "audi", 2025, 0, 0, 0, 0, 45,
    "Back-to-back junior champion (F3, F2) graduating into Audi's first works driver pairing.",
    [{ season: 2025, teamId: "sauber" }, { season: 2026, teamId: "audi" }]),
].filter((x) => x.id !== "norris-placeholder");

export const driverById = (id: string): Driver | undefined =>
  drivers.find((dr) => dr.id === id);

export const driversForTeam = (teamId: string): Driver[] =>
  drivers.filter((dr) => dr.teamId === teamId);

export const nationalityFlag = (countryCode: string): string => {
  const map: Record<string, string> = {
    GB: "🇬🇧", NL: "🇳🇱", MC: "🇲🇨", AU: "🇦🇺", ES: "🇪🇸", CA: "🇨🇦",
    TH: "🇹🇭", FR: "🇫🇷", AR: "🇦🇷", JP: "🇯🇵", IT: "🇮🇹", DE: "🇩🇪",
    BR: "🇧🇷", NZ: "🇳🇿", US: "🇺🇸", MX: "🇲🇽", CN: "🇨🇳", FI: "🇫🇮",
  };
  return map[countryCode] ?? "🏳️";
};
