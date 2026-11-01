import type { Car } from "./types";

// SAMPLE CATALOGUE — designations marked verified:false are illustrative.
const baseComponents = (wing: string) => [
  {
    id: "front-wing",
    name: "Front Wing",
    plain: `The first part of the car to meet the air. It sets the mood for the whole car and ${wing}.`,
    deep: "A multi-element composite assembly regulating flow into the Y250 vortex region, front-tyre wake and the underfloor inlet. Element flap angles are cambered within regulation tolerance and trimmed per circuit to balance front-axle load against rear-wing beam loading.",
  },
  {
    id: "nose",
    name: "Nose & Chassis",
    plain: "The carbon-fibre structure that carries the driver's survival cell and mounts the front suspension.",
    deep: "The monocoque is a laminated carbon-fibre tub with an approved anti-intrusion structure. The nose section routes airflow around the sidepods and houses crash structures tested under FIA homologation loads.",
  },
  {
    id: "suspension",
    name: "Suspension",
    plain: "The arms, uprights and springs that hold the wheels and let the car lean on its tyres through corners.",
    deep: "Pushrod-actuated front, pullrod-actuated rear torsion-spring assemblies with inboard damping. Geometry is tuned for anti-dive and anti-squat within aerodynamic packaging constraints, and kinematics are validated against FIA ride-height tests.",
  },
  {
    id: "floor",
    name: "Floor",
    plain: "The flat wooden-threshold plate and shaped edges under the car — where most of a modern F1 car's grip is made.",
    deep: "Ground-effect underbody with regulated edge wings and diffuser ramps accelerating air beneath the car. Venturi tunnels generate the majority of total downforce; ride-height sensitivity (porpoising) is managed through suspension stiffening and floor-edge fences.",
  },
  {
    id: "sidepods",
    name: "Sidepods",
    plain: "The bodywork beside the driver that feeds cooling air to the radiators and cleans up airflow to the rear.",
    deep: "Ducted heat exchanger housings with regulation inlet sizing. Downwash ramp geometry conditions flow toward the rear wing and beam wing, trading cooling efficiency against aerodynamic load.",
  },
  {
    id: "engine-cover",
    name: "Engine Cover & Halo",
    plain: "The spine over the power unit and the titanium loop above the cockpit that protects the driver's head.",
    deep: "The Halo is a titanium hoop tested to withstand 12 tonnes of static load. The cover shrouds the power unit, energy store and cooling plumbing while smoothing flow separation over the cockpit region.",
  },
  {
    id: "rear-wing",
    name: "Rear Wing",
    plain: "The wing at the back that pushes the rear tyres into the road. Its movable flap is the DRS overtaking aid.",
    deep: "Twin-element assembly with an actuated upper flap (DRS) permitted in defined zones. Load is limited by homologated deflection tests; beam-wing and diffuser interaction defines the car's rear stability under braking.",
  },
];

export const cars: Car[] = [
  {
    id: "mclaren-2026",
    teamId: "mclaren",
    season: 2026,
    designation: "MCL40",
    designationVerified: false,
    image: "orange",
    summary:
      "McLaren's fourth car of the ground-effect era, refined around the new power-unit rules and built to defend back-to-back titles.",
    specs: [
      { label: "Power unit", value: "Mercedes PU66B (sample)", verified: false },
      { label: "Minimum weight", value: "798 kg (regulation)", verified: true },
      { label: "Overall length", value: "≈5.6 m (typical)", verified: false },
      { label: "Gearbox", value: "8-speed sequential, carbon", verified: true },
      { label: "Downforce concept", value: "Ground effect + wing elements", verified: true },
    ],
    components: baseComponents("shapes the airflow the floor depends on"),
  },
  {
    id: "ferrari-2026",
    teamId: "ferrari",
    season: 2026,
    designation: "SF-26",
    designationVerified: false,
    image: "red",
    summary:
      "Maranello's 2026 challenger, the car Hamilton and Leclerc share, optimised for the Ferrari 066-class power unit.",
    specs: [
      { label: "Power unit", value: "Ferrari 066 (sample)", verified: false },
      { label: "Minimum weight", value: "798 kg (regulation)", verified: true },
      { label: "Overall length", value: "≈5.6 m (typical)", verified: false },
      { label: "Gearbox", value: "8-speed sequential, carbon", verified: true },
      { label: "Downforce concept", value: "Ground effect + wing elements", verified: true },
    ],
    components: baseComponents("feeds clean air into the underfloor tunnels"),
  },
  {
    id: "red-bull-2026",
    teamId: "red-bull",
    season: 2026,
    designation: "RB22",
    designationVerified: false,
    image: "silver",
    summary:
      "The first Red Bull built around its own Ford-based power unit, pursuing the aerodynamic efficiency the team is famous for.",
    specs: [
      { label: "Power unit", value: "Red Bull Ford (sample)", verified: false },
      { label: "Minimum weight", value: "798 kg (regulation)", verified: true },
      { label: "Overall length", value: "≈5.6 m (typical)", verified: false },
      { label: "Gearbox", value: "8-speed sequential, carbon", verified: true },
      { label: "Downforce concept", value: "Ground effect + wing elements", verified: true },
    ],
    components: baseComponents("carries the low-drag philosophy the team is known for"),
  },
  {
    id: "mercedes-2026",
    teamId: "mercedes",
    season: 2026,
    designation: "W17",
    designationVerified: false,
    image: "silver",
    summary:
      "Brackley's new-regulation car, paired with the power unit most of the grid buys — and the one Mercedes knows best.",
    specs: [
      { label: "Power unit", value: "Mercedes PU66B (sample)", verified: false },
      { label: "Minimum weight", value: "798 kg (regulation)", verified: true },
      { label: "Overall length", value: "≈5.6 m (typical)", verified: false },
      { label: "Gearbox", value: "8-speed sequential, carbon", verified: true },
      { label: "Downforce concept", value: "Ground effect + wing elements", verified: true },
    ],
    components: baseComponents("balances cooling demand against drag"),
  },
  {
    id: "aston-martin-2026",
    teamId: "aston-martin",
    season: 2026,
    designation: "AMR26",
    designationVerified: false,
    image: "silver",
    summary:
      "The first Aston Martin with Honda power, designed inside the team's new Silverstone technology campus.",
    specs: [
      { label: "Power unit", value: "Honda (sample)", verified: false },
      { label: "Minimum weight", value: "798 kg (regulation)", verified: true },
      { label: "Overall length", value: "≈5.6 m (typical)", verified: false },
      { label: "Gearbox", value: "8-speed sequential, carbon", verified: true },
      { label: "Downforce concept", value: "Ground effect + wing elements", verified: true },
    ],
    components: baseComponents("channels air from the Honda unit's packaging"),
  },
  {
    id: "williams-2026",
    teamId: "williams",
    season: 2026,
    designation: "FW48",
    designationVerified: false,
    image: "silver",
    summary:
      "Grove's 2026 car, the follow-up to the rebuilt FW line that returned Williams to the midfield fight.",
    specs: [
      { label: "Power unit", value: "Mercedes PU66B (sample)", verified: false },
      { label: "Minimum weight", value: "798 kg (regulation)", verified: true },
      { label: "Overall length", value: "≈5.6 m (typical)", verified: false },
      { label: "Gearbox", value: "8-speed sequential, carbon", verified: true },
      { label: "Downforce concept", value: "Ground effect + wing elements", verified: true },
    ],
    components: baseComponents("maximises the documented Mercedes packaging"),
  },
  {
    id: "alpine-2026",
    teamId: "alpine",
    season: 2026,
    designation: "A526",
    designationVerified: false,
    image: "red",
    summary:
      "Enstone's Mercedes-powered reset — a chassis designed around an engine the team no longer builds itself.",
    specs: [
      { label: "Power unit", value: "Mercedes PU66B (sample)", verified: false },
      { label: "Minimum weight", value: "798 kg (regulation)", verified: true },
      { label: "Overall length", value: "≈5.6 m (typical)", verified: false },
      { label: "Gearbox", value: "8-speed sequential, carbon", verified: true },
      { label: "Downforce concept", value: "Ground effect + wing elements", verified: true },
    ],
    components: baseComponents("works around the customer-unit cooling envelope"),
  },
  {
    id: "racing-bulls-2026",
    teamId: "racing-bulls",
    season: 2026,
    designation: "VCTB26",
    designationVerified: false,
    image: "orange",
    summary:
      "The Faenza team's 2026 machine, often an aerodynamic testbed of ideas that later migrate to Red Bull.",
    specs: [
      { label: "Power unit", value: "Red Bull Ford (sample)", verified: false },
      { label: "Minimum weight", value: "798 kg (regulation)", verified: true },
      { label: "Overall length", value: "≈5.6 m (typical)", verified: false },
      { label: "Gearbox", value: "8-speed sequential, carbon", verified: true },
      { label: "Downforce concept", value: "Ground effect + wing elements", verified: true },
    ],
    components: baseComponents("develops concepts that flow up to the senior team"),
  },
  {
    id: "haas-2026",
    teamId: "haas",
    season: 2026,
    designation: "VF-26",
    designationVerified: false,
    image: "red",
    summary:
      "Kannapolis' 2026 entry, the deepest Ferrari customer programme on the grid in both chassis services and power unit.",
    specs: [
      { label: "Power unit", value: "Ferrari 066 (sample)", verified: false },
      { label: "Minimum weight", value: "798 kg (regulation)", verified: true },
      { label: "Overall length", value: "≈5.6 m (typical)", verified: false },
      { label: "Gearbox", value: "8-speed sequential, carbon", verified: true },
      { label: "Downforce concept", value: "Ground effect + wing elements", verified: true },
    ],
    components: baseComponents("relies on the documented Ferrari supply package"),
  },
  {
    id: "audi-2026",
    teamId: "audi",
    season: 2026,
    designation: "R26",
    designationVerified: false,
    image: "silver",
    summary:
      "Audi's first true works Formula 1 car, Hinwil chassis matched to a power unit developed in Neuburg.",
    specs: [
      { label: "Power unit", value: "Audi (sample)", verified: false },
      { label: "Minimum weight", value: "798 kg (regulation)", verified: true },
      { label: "Overall length", value: "≈5.6 m (typical)", verified: false },
      { label: "Gearbox", value: "8-speed sequential, carbon", verified: true },
      { label: "Downforce concept", value: "Ground effect + wing elements", verified: true },
    ],
    components: baseComponents("integrates Audi's unique high-voltage packaging"),
  },
];

export const carById = (id: string): Car | undefined =>
  cars.find((c) => c.id === id);

export const carsForTeam = (teamId: string): Car[] =>
  cars.filter((c) => c.teamId === teamId);
