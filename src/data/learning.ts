// Learning centre content — editorial copy written for this platform.
export interface LearnTopic {
  id: string;
  title: string;
  summary: string;
  simple: string;
  deep: string;
  category: string;
}

export interface LearnCategory {
  id: string;
  title: string;
  description: string;
}

export const learnCategories: LearnCategory[] = [
  {
    id: "weekend",
    title: "Race weekend & qualifying",
    description:
      "How a Grand Prix weekend unfolds, from first practice to the podium.",
  },
  {
    id: "rules",
    title: "Rules, flags & penalties",
    description:
      "The rulebook stewards enforce and the flags drivers watch for.",
  },
  {
    id: "points",
    title: "Championship points",
    description: "How points are scored, awarded and what ties mean.",
  },
  {
    id: "tyres",
    title: "Tyres & pit strategy",
    description: "Compounds, windows, and how races are won in the pit lane.",
  },
  {
    id: "aero",
    title: "Aerodynamics & downforce",
    description:
      "Why F1 cars grip like they do — wings, floors and ground effect.",
  },
  {
    id: "power",
    title: "Power units & energy recovery",
    description: "Hybrid V6s, MGU-K, MGU-H and the 2026 reset.",
  },
  {
    id: "timing",
    title: "Understanding live timing",
    description: "How to read a timing screen like a race engineer.",
  },
];

export const learnTopics: LearnTopic[] = [
  {
    id: "weekend-format",
    title: "The race weekend format",
    category: "weekend",
    summary: "Practice, qualifying and the Grand Prix — plus sprints.",
    simple:
      "A standard weekend has three practice sessions, one qualifying session that sets the grid, and the Grand Prix on Sunday. Some weekends swap to a sprint format with a shorter second race.",
    deep: "Friday typically runs two 60-minute practices (FP1/FP2), Saturday holds FP3 before a three-part qualifying: Q1 (18 min, all 20 cars), Q2 (15 min, 15 cars) and Q3 (12 min, top 10). Slowest five are eliminated in each of Q1/Q2. Sprint weekends move qualifying to Friday and run a sprint race Saturday, separate from Sunday's Grand Prix.",
  },
  {
    id: "grid-decided",
    title: "How the grid is decided",
    category: "weekend",
    summary: "Qualifying times, penalties, and why cars start where they do.",
    simple:
      "The fastest lap in qualifying wins pole position. Penalties for engine changes or on-track incidents push drivers down the grid.",
    deep: "Grid order follows qualifying classification, adjusted by time penalties (5s/10s race penalties apply at the flag, grid penalties apply at the start). Power-unit component changes beyond allocation trigger grid drops. If a driver cannot set a time within 107% of Q1's fastest, stewards may still permit a start.",
  },
  {
    id: "flags",
    title: "Flags & race control",
    category: "rules",
    summary: "Yellow, red, blue — what each flag demands.",
    simple:
      "Yellow means danger, slow down and don't overtake. Red stops the race. Blue means let the faster car behind past.",
    deep: "Single yellow: no overtaking, reduce speed, be prepared to stop. Double yellow: significant danger — slow right down, potentially to a crawl. Red: session suspended, cars return to the pit lane slowly. Blue: lapped car must yield to the leader within a defined number of flags or face penalties. Green: track clear. Chequered: session complete.",
  },
  {
    id: "penalties",
    title: "Penalties explained",
    category: "rules",
    summary: "Time penalties, grid drops and licence points.",
    simple:
      "Drivers can be given a 5 or 10 second time penalty, pushed back on the grid, or lose points on their racing licence for repeat offences.",
    deep: "Time penalties (5s/10s) are served at the pit stop or added to race time. Grid penalties defer to the start. Twelve licence points in a 12-month period triggers a one-race ban. Track-limit abuse accumulates warnings before time penalties apply.",
  },
  {
    id: "points",
    title: "How points work",
    category: "points",
    summary: "25-18-15-12-10-8-6-4-2-1 and fastest lap's return.",
    simple:
      "The top ten score points: 25 for a win down to 1 for tenth. Both championship titles are decided by adding these across the season.",
    deep: "Points: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1. Sprint races award their own scale. A race must reach half distance for half points and two laps minimum for classification. Ties are broken by countback of better finishes, then wins, and so on. The Drivers' title is individual; the Constructors' title adds both cars of each team and decides prize money.",
  },
  {
    id: "tyres",
    title: "Tyre compounds",
    category: "tyres",
    summary: "Softs, mediums and hards — speed versus life.",
    simple:
      "Softer tyres are faster but wear out quickly; harder tyres last longer but are slower. Teams pick when to switch.",
    deep: "Each weekend brings three dry compounds (typically C1-C6 range, named soft/medium/hard) plus intermediates and full wets for rain. Nominal race distance on one set varies with track abrasiveness, temperature and car balance. At least two compounds must be used in a dry race unless it is declared wet.",
  },
  {
    id: "pit-strategy",
    title: "Pit strategy basics",
    category: "tyres",
    summary: "One stop or two, undercut or overcut.",
    simple:
      "Stops cost roughly 20-25 seconds of total time. Teams weigh tyre wear, traffic and a rival's moves to decide how many stops to make.",
    deep: "A stationary stop is ~2-2.5s; the total positional cost is 18-25s depending on pit-lane speed. An undercut exploits fresh-tyre pace before a rival pits; an overcut relies on clean air pace on older tyres. Safety cars compress strategy — stop windows collapse and pitting becomes nearly free in relative terms.",
  },
  {
    id: "downforce",
    title: "Downforce & ground effect",
    category: "aero",
    summary: "Why an F1 car could drive on a ceiling.",
    simple:
      "F1 cars use shaped wings and floors to push air upward, which pushes the car down — more downforce means more grip in corners.",
    deep: "Modern cars generate most load from venturi tunnels under the floor (ground effect), with the wings trimming balance. Drag is the price: a straight-line trade. Drag Reduction System (DRS) opens a rear flap within 1m of a car ahead in defined zones. Porpoising is the aerodynamic instability from ride-height sensitivity of the floor.",
  },
  {
    id: "power-unit",
    title: "The power unit",
    category: "power",
    summary: "A 1.6-litre V6 hybrid that recovers its own energy.",
    simple:
      "The engine is a 1.6-litre turbo V6 with electric systems that harvest braking energy and exhaust heat, then redeploy it for speed.",
    deep: "Components: ICE (internal combustion engine), turbocharger, MGU-K (recovers braking energy, deployable at 120kW), MGU-H (turbine energy recovery), ES (energy store) and CE (control electronics). Allocation limits per component per season. The 2026 rules shift to near-50% electrical deploy with 100% sustainable fuel, with the MGU-H removed.",
  },
  {
    id: "timing-screens",
    title: "Reading the timing screen",
    category: "timing",
    summary: "Gaps, intervals, sectors and purple/green times.",
    simple:
      "The leaderboard shows where everyone is, their last lap, fastest lap and the gap to the car ahead. Purple is fastest of the session, green is a personal best.",
    deep: "Gap to leader vs interval to car ahead answers different questions: the gap shows race position loss, the interval shows the immediate battle. Personal-best sectors turn green, session-best turn purple. Pit indicators, tyre compounds and DRS status complete the picture. Live position is only reliable when the field crosses the same line — between lines it is an estimate.",
  },
  {
    id: "overtaking",
    title: "Why overtaking is hard",
    category: "weekend",
    summary: "Dirty air, tyre wear and the tow.",
    simple:
      "Following closely makes a car slower because it sits in 'dirty air' — disturbed airflow reduces grip. That's why strategy and DRS matter.",
    deep: "Turbulent wake reduces downstream wing efficiency and front-tyre load, widening the following-distance needed for equal performance. 2022 ground-effect rules reduced this sensitivity, though dirty air remains the defining constraint. The slipstream (tow) helps on straights but hurts in corners.",
  },
];

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

export const glossary: GlossaryTerm[] = [
  {
    term: "Apex",
    definition:
      "The innermost point of a corner — the theoretical fastest line clips it.",
    category: "Driving",
  },
  {
    term: "Backmarker",
    definition: "A driver about to be lapped by the race leader.",
    category: "Racecraft",
  },
  {
    term: "Ballast",
    definition:
      "Added weight placed low in the car to improve balance and meet minimum weight.",
    category: "Technical",
  },
  {
    term: "Bleeding",
    definition:
      "Opening the tyres in a slow weave to shed heat on a slow-down lap.",
    category: "Technical",
  },
  {
    term: "Box",
    definition: "Radio call telling a driver to enter the pit lane this lap.",
    category: "Strategy",
  },
  {
    term: "Brake bias",
    definition:
      "The front/rear distribution of braking force, adjustable from the wheel.",
    category: "Technical",
  },
  {
    term: "Clean air",
    definition: "Running without a car ahead — full aerodynamic performance.",
    category: "Aerodynamics",
  },
  {
    term: "Dirty air",
    definition:
      "Turbulent airflow from a car ahead that reduces a following car's grip.",
    category: "Aerodynamics",
  },
  {
    term: "DRS",
    definition:
      "Drag Reduction System — opens the rear wing flap in defined zones to aid overtaking.",
    category: "Technical",
  },
  {
    term: "Delta",
    definition: "The time difference against a reference lap or target.",
    category: "Data",
  },
  {
    term: "Diffuser",
    definition:
      "The expanding underbody exit that accelerates airflow and generates load.",
    category: "Technical",
  },
  {
    term: "Downforce",
    definition:
      "Aerodynamic load pressing the car into the track, enabling higher cornering speed.",
    category: "Aerodynamics",
  },
  {
    term: "Drive-through penalty",
    definition:
      "Penalty requiring a pit-lane pass without stopping — one of the harshest.",
    category: "Rules",
  },
  {
    term: "ERB",
    definition:
      "Energy Recovery System — the MGU-K and MGU-H harvesting energy under braking and from the turbo.",
    category: "Power unit",
  },
  {
    term: "Flat spot",
    definition:
      "A locked wheel patch that ruins tyre balance and sets off vibration.",
    category: "Technical",
  },
  {
    term: "Formation lap",
    definition:
      "The slow lap before the start where drivers warm tyres and brakes.",
    category: "Racecraft",
  },
  {
    term: "Graining",
    definition:
      "Surface tyre wear where rubber rolls over itself, causing vibration and slide.",
    category: "Technical",
  },
  {
    term: "Halo",
    definition: "Titanium cockpit protection hoop, mandatory since 2018.",
    category: "Safety",
  },
  {
    term: "Jump start",
    definition: "Moving before the start signal — punishable by penalty.",
    category: "Rules",
  },
  {
    term: "Kerbs",
    definition:
      "Red-and-white painted edge strips; riding them can be fast or destructive.",
    category: "Racecraft",
  },
  {
    term: "Lift and coast",
    definition:
      "Lifting off throttle early into a braking zone to save fuel and brakes.",
    category: "Strategy",
  },
  {
    term: "MGU-K",
    definition:
      "Motor Generator Unit — Kinetic: recovers braking energy, deploys up to 120kW.",
    category: "Power unit",
  },
  {
    term: "Oversteer",
    definition: "Rear-end slide where the car rotates more than steered.",
    category: "Driving",
  },
  {
    term: "Parc fermé",
    definition:
      "Sealed impound where cars are held after qualifying and before the race.",
    category: "Rules",
  },
  {
    term: "Porch",
    definition:
      "The covered section of a pit box protecting equipment from weather.",
    category: "Paddock",
  },
  {
    term: "Porpoising",
    definition: "Aerodynamic bouncing from floor load oscillation at speed.",
    category: "Technical",
  },
  {
    term: "Qualifying trim",
    definition: "Low-fuel, new-tyre setup used for one-lap pace in qualifying.",
    category: "Strategy",
  },
  {
    term: "Safety car",
    definition:
      "Official car leading the field at reduced pace after an incident, neutralising the race.",
    category: "Rules",
  },
  {
    term: "Slipstream",
    definition: "The tow behind a car that increases straight-line speed.",
    category: "Racecraft",
  },
  {
    term: "Understeer",
    definition: "Front-end wash-out where the car turns less than steered.",
    category: "Driving",
  },
  {
    term: "Virtual safety car",
    definition:
      "A safety-car period enforced by minimum sector time deltas instead of a physical car.",
    category: "Rules",
  },
  {
    term: "Wheel to wheel",
    definition: "Two cars racing side by side through a corner.",
    category: "Racecraft",
  },
];

export const glossaryCategories = [
  "Driving",
  "Racecraft",
  "Technical",
  "Strategy",
  "Rules",
  "Data",
  "Aerodynamics",
  "Power unit",
  "Safety",
  "Paddock",
];
