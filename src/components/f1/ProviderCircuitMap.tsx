import { useMemo } from "react";
import type { LiveWeekend } from "@/api/client";

type Point = { x: number; y: number };

const WIDTH = 800;
const HEIGHT = 500;
const PADDING = 54;

function rotate(point: Point, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  return {
    x: point.x * Math.cos(radians) - point.y * Math.sin(radians),
    y: point.x * Math.sin(radians) + point.y * Math.cos(radians),
  };
}

export function ProviderCircuitMap({
  circuit,
  className = "",
}: {
  circuit: LiveWeekend["circuit"];
  className?: string;
}) {
  const geometry = useMemo(() => {
    if (circuit.path.length < 2) return undefined;
    const rotatedPath = circuit.path.map((point) =>
      rotate(point, circuit.rotation ?? 0),
    );
    const rotatedCorners = circuit.corners.map((corner) => ({
      ...rotate(corner, circuit.rotation ?? 0),
      number: corner.number,
    }));
    const allPoints = [...rotatedPath, ...rotatedCorners];
    const minX = Math.min(...allPoints.map((point) => point.x));
    const maxX = Math.max(...allPoints.map((point) => point.x));
    const minY = Math.min(...allPoints.map((point) => point.y));
    const maxY = Math.max(...allPoints.map((point) => point.y));
    const scale = Math.min(
      (WIDTH - PADDING * 2) / Math.max(maxX - minX, 1),
      (HEIGHT - PADDING * 2) / Math.max(maxY - minY, 1),
    );
    const contentWidth = (maxX - minX) * scale;
    const contentHeight = (maxY - minY) * scale;
    const offsetX = (WIDTH - contentWidth) / 2;
    const offsetY = (HEIGHT - contentHeight) / 2;
    const project = (point: Point) => ({
      x: offsetX + (point.x - minX) * scale,
      y: HEIGHT - (offsetY + (point.y - minY) * scale),
    });
    const path = rotatedPath.map(project);
    return {
      path: path
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
        )
        .join(" "),
      start: path[0],
      corners: rotatedCorners.map((corner) => ({
        ...project(corner),
        number: corner.number,
      })),
    };
  }, [circuit]);

  if (!geometry) return null;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={className}
      role="img"
      aria-label={`${circuit.name} detailed circuit layout`}
    >
      <defs>
        <filter id="circuit-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={geometry.path}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={geometry.path}
        fill="none"
        stroke="#e8e8e6"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#circuit-glow)"
      />
      {geometry.start && (
        <circle
          cx={geometry.start.x}
          cy={geometry.start.y}
          r="8"
          fill="#e10600"
          stroke="#fff"
          strokeWidth="3"
        />
      )}
      {geometry.corners.map((corner) => (
        <g key={corner.number}>
          <circle
            cx={corner.x}
            cy={corner.y}
            r="10"
            fill="#111217"
            stroke="#e10600"
            strokeWidth="2"
          />
          <text
            x={corner.x}
            y={corner.y + 3.5}
            textAnchor="middle"
            fontSize="10"
            fill="#fff"
            fontWeight="700"
          >
            {corner.number}
          </text>
        </g>
      ))}
    </svg>
  );
}
