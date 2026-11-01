import { useEffect, useState } from "react";

function split(iso: string): { d: number; h: number; m: number; s: number; done: boolean } {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: false };
}

/**
 * Functional countdown driven by a configured event timestamp (raceDateIso).
 * Renders a stable "— —" placeholder on the server; ticks after hydration.
 */
export function Countdown({
  targetIso,
  size = "lg",
  onDone,
}: {
  targetIso: string;
  size?: "sm" | "lg";
  onDone?: () => void;
}) {
  const [t, setT] = useState<{ d: number; h: number; m: number; s: number; done: boolean } | null>(null);

  useEffect(() => {
    const update = () => setT(split(targetIso));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  useEffect(() => {
    if (t?.done) onDone?.();
  }, [t?.done, onDone]);

  const cell = (v: number | null, label: string) => (
    <div className="flex flex-col items-center">
      <span
        className={`tabular text-foreground font-semibold leading-none ${
          size === "lg" ? "text-4xl sm:text-5xl" : "text-lg"
        }`}
      >
        {t === null ? "––" : String(v).padStart(2, "0")}
      </span>
      <span className="eyebrow mt-2 text-[10px] text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <div className={`flex items-start ${size === "lg" ? "gap-6 sm:gap-10" : "gap-4"}`}>
      {cell(t?.d ?? null, "Days")}
      <span className={`tabular text-2xl text-muted-foreground/50 ${size === "lg" ? "text-5xl" : ""}`}>:</span>
      {cell(t?.h ?? null, "Hours")}
      <span className={`tabular text-2xl text-muted-foreground/50 ${size === "lg" ? "text-5xl" : ""}`}>:</span>
      {cell(t?.m ?? null, "Min")}
      <span className={`tabular text-2xl text-muted-foreground/50 ${size === "lg" ? "text-5xl" : ""}`}>:</span>
      {cell(t?.s ?? null, "Sec")}
    </div>
  );
}
