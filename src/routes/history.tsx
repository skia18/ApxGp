import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageTitle } from "@/components/f1/SectionHeading";
import { ConstructorIdentity, DriverIdentity } from "@/components/f1/Identity";
import { champions, iconicRaces, records, seasonRecords } from "@/data/history";
import { constructorById } from "@/data/constructors";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History & Records — Champions, Archive, Records | Apex F1" },
      { name: "description", content: "The Wall of Champions, constructors' championship archive, iconic races and all-time records." },
      { property: "og:title", content: "History & Records — Apex F1" },
      { property: "og:description", content: "Champions, archives, iconic races and all-time records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [championship, setChampionship] = useState<"drivers" | "constructors">("drivers");
  const [openRace, setOpenRace] = useState<string | null>(iconicRaces[0]?.id ?? null);
  const driverTitles = new Map<string, typeof champions>();
  for (const champion of champions) {
    const titles = driverTitles.get(champion.driverId) ?? [];
    titles.push(champion);
    driverTitles.set(champion.driverId, titles);
  }
  const wall = [...driverTitles.entries()].sort((a, b) => b[1].length - a[1].length);
  const constructorTitles = new Map<string, number>();
  for (const champion of champions) {
    constructorTitles.set(champion.constructorId, (constructorTitles.get(champion.constructorId) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageTitle eyebrow="History & Records" title="Champions & the archive" description="Modern-era coverage first, structured so earlier seasons can slot in later. Drivers' and Constructors' Championships are kept strictly separate." />

      <section className="mt-10">
        <div className="flex gap-1 border-b border-border">
          {(["drivers", "constructors"] as const).map((tab) => (
            <button key={tab} onClick={() => setChampionship(tab)} className={`px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest transition-colors ${championship === tab ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {tab === "drivers" ? "Drivers' Wall of Champions" : "Constructors' Archive"}
            </button>
          ))}
        </div>

        {championship === "drivers" ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {wall.map(([driverId, titles]) => {
              const latest = titles[0];
              if (!latest) return null;
              return (
                <Link key={driverId} to="/grid/drivers/$driverId" params={{ driverId }} className="panel group p-5 transition-colors hover:border-muted-foreground/40">
                  <div className="flex items-center justify-between">
                    <span className="tabular text-xs text-muted-foreground">{titles.length}× champion</span>
                    <span className="tabular text-xs text-muted-foreground">latest {latest.season}</span>
                  </div>
                  <h3 className="headline mt-3 text-lg">{latest.driverName}</h3>
                  <ConstructorIdentity teamId={latest.constructorId} size="sm" link={false} />
                  <div className="mt-3 flex flex-wrap gap-1">
                    {titles.map((title) => <span key={title.season} className="rounded-sm bg-secondary px-1.5 py-0.5 tabular text-[10px] text-muted-foreground">{title.season}</span>)}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...constructorTitles.entries()].sort((a, b) => b[1] - a[1]).map(([teamId, count]) => {
              const team = constructorById(teamId);
              return (
                <Link key={teamId} to="/grid/constructors/$teamId" params={{ teamId }} className="panel group p-5 transition-colors hover:border-muted-foreground/40">
                  <div className="flex items-center justify-between">
                    <span className="h-4 w-6 rounded-sm" style={{ backgroundColor: team?.color }} />
                    <span className="tabular text-xs text-muted-foreground">{count}× in era shown</span>
                  </div>
                  <h3 className="headline mt-3 text-lg">{team?.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{team?.constructorsTitles} all-time titles</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="headline text-xl">Season archive</h2>
        <p className="mt-1 text-xs text-muted-foreground">Each season links to its champion driver and champion constructor.</p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead><tr className="bg-secondary/60 text-[10px] uppercase tracking-widest text-muted-foreground"><th className="px-4 py-2.5 font-semibold">Season</th><th className="px-4 py-2.5 font-semibold">Races</th><th className="px-4 py-2.5 font-semibold">Drivers' champion</th><th className="px-4 py-2.5 font-semibold">Constructors' champion</th></tr></thead>
            <tbody>
              {seasonRecords.map((season) => (
                <tr key={season.season} className="border-t border-border/50">
                  <td className="px-4 py-2.5 tabular font-semibold">{season.season}</td>
                  <td className="px-4 py-2.5 tabular text-muted-foreground">{season.races}</td>
                  <td className="px-4 py-2.5">{season.driverChampionId === "tbd" ? <span className="text-xs text-muted-foreground">In progress</span> : <DriverIdentity driverId={season.driverChampionId} size="sm" />}</td>
                  <td className="px-4 py-2.5">{season.constructorChampionId === "tbd" ? <span className="text-xs text-muted-foreground">In progress</span> : <ConstructorIdentity teamId={season.constructorChampionId} size="sm" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="headline text-xl">Iconic races</h2>
        <div className="mt-4 space-y-3">
          {iconicRaces.map((race) => {
            const open = openRace === race.id;
            return (
              <div key={race.id} className="panel overflow-hidden">
                <button onClick={() => setOpenRace(open ? null : race.id)} className="flex w-full items-center justify-between p-5 text-left">
                  <div><p className="eyebrow text-[10px] text-muted-foreground">{race.season} · {race.circuit}</p><h3 className="headline mt-1 text-lg">{race.race}</h3></div>
                  <span className={`ml-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
                </button>
                {open && <div className="border-t border-border px-5 py-4"><p className="text-sm font-semibold">{race.headline}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{race.story}</p></div>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="headline text-xl">Career & championship records</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {records.map((record) => <div key={record.label} className="panel flex items-center justify-between gap-4 p-4"><p className="text-xs text-muted-foreground">{record.label}</p><p className="text-right text-xs font-semibold">{record.value}</p></div>)}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground/80">Records reflect all-time totals; champion-era data above covers the modern seasons archived so far and extends backwards as coverage grows.</p>
      </section>
    </div>
  );
}
