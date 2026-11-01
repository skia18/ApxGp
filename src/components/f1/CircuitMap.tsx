import type { Circuit } from "@/data/types";
import { SECTOR_COLORS } from "@/data/circuits";

/**
 * Circuit visualisation: track outline, sector divisions (dashed-colour
 * thirds), start/finish line and turn markers. Placeholder until positional
 * telemetry exists — driver markers are intentionally not fabricated.
 */
export function CircuitMap({
  circuit,
  className = "",
}: {
  circuit: Circuit;
  className?: string;
}) {
  const [s1, s2] = circuit.sectors;
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`${circuit.name} circuit outline`}
    >
      {/* Sector segments drawn as thirds of the same path */}
      <path d={circuit.svgPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5.5} strokeLinejoin="round" />
      <path
        d={circuit.svgPath} fill="none" strokeWidth={3.4} strokeLinejoin="round"
        stroke={SECTOR_COLORS[0]}
        pathLength={1}
        strokeDasharray={`${s1} ${1 - s1}`}
      />
      <path
        d={circuit.svgPath} fill="none" strokeWidth={3.4} strokeLinejoin="round"
        stroke={SECTOR_COLORS[1]}
        pathLength={1}
        strokeDasharray={`${s2} ${1 - s2}`}
        strokeDashoffset={-s1}
      />
      <path
        d={circuit.svgPath} fill="none" strokeWidth={3.4} strokeLinejoin="round"
        stroke={SECTOR_COLORS[2]}
        pathLength={1}
        strokeDasharray={`${1 - s1 - s2} ${s1 + s2}`}
        strokeDashoffset={-(s1 + s2)}
      />
      {/* Start/finish tick — placed on the first straight by convention */}
      <line x1="16" y1="24" x2="16" y2="34" stroke="#f5f5f4" strokeWidth={1.6} />
      {circuit.turnMarkers.map((t) => (
        <g key={t.n}>
          <circle cx={t.x} cy={t.y} r={2.6} fill="#0c0c10" stroke={SECTOR_COLORS[0]} strokeWidth={0.7} />
          <text x={t.x} y={t.y + 1.1} textAnchor="middle" fontSize={3.2} fill="#e8e8e6" fontWeight={600}>
            {t.n}
          </text>
        </g>
      ))}
    </svg>
  );
}
