import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageTitle } from "@/components/f1/SectionHeading";
import {
  learnCategories,
  learnTopics,
  glossary,
  glossaryCategories,
} from "@/data/learning";
import { drivers, nationalityFlag } from "@/data/drivers";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn F1 — Guides & Glossary | Apex F1" },
      {
        name: "description",
        content:
          "Beginner-friendly guides to race weekends, rules, tyres, aerodynamics and power units, plus a searchable F1 glossary.",
      },
      { property: "og:title", content: "Learn F1 — Apex F1" },
      {
        property: "og:description",
        content:
          "Guides to qualifying, strategy, aero, power units and a searchable glossary.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  const [category, setCategory] = useState("all");
  const [openTopic, setOpenTopic] = useState<string | null>(
    learnTopics[0]?.id ?? null,
  );
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [glossaryCategory, setGlossaryCategory] = useState("all");

  const topics = useMemo(
    () =>
      learnTopics.filter(
        (topic) => category === "all" || topic.category === category,
      ),
    [category],
  );
  const terms = useMemo(
    () =>
      glossary.filter(
        (entry) =>
          (glossaryCategory === "all" || entry.category === glossaryCategory) &&
          `${entry.term} ${entry.definition}`
            .toLowerCase()
            .includes(glossaryQuery.toLowerCase()),
      ),
    [glossaryCategory, glossaryQuery],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageTitle
        eyebrow="Learn F1"
        title="Learning centre"
        description="Concise explanations with both a plain-language version and deeper technical detail. Start wherever you like — every topic stands alone."
      />

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterChip
          active={category === "all"}
          onClick={() => setCategory("all")}
          label="All topics"
        />
        {learnCategories.map((item) => (
          <FilterChip
            key={item.id}
            active={category === item.id}
            onClick={() => setCategory(item.id)}
            label={item.title}
          />
        ))}
      </div>

      <section className="mt-6 grid gap-3 md:grid-cols-2">
        {topics.map((topic) => {
          const open = openTopic === topic.id;
          return (
            <article key={topic.id} className="panel overflow-hidden">
              <button
                onClick={() => setOpenTopic(open ? null : topic.id)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <div>
                  <p className="eyebrow text-[10px] text-primary">
                    {
                      learnCategories.find((item) => item.id === topic.category)
                        ?.title
                    }
                  </p>
                  <h2 className="headline mt-1.5 text-lg">{topic.title}</h2>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {topic.summary}
                  </p>
                </div>
                <span
                  className={`ml-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>
              {open && (
                <div className="border-t border-border px-5 py-5">
                  <p className="eyebrow text-[10px] text-muted-foreground">
                    In simple terms
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{topic.simple}</p>
                  <div className="mt-5 border-t border-border pt-4">
                    <p className="eyebrow text-[10px] text-muted-foreground">
                      Deeper detail
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {topic.deep}
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="mt-16">
        <PageTitle
          eyebrow="Reference"
          title="F1 glossary"
          description="Searchable terminology — from apex to virtual safety car."
        />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            value={glossaryQuery}
            onChange={(event) => setGlossaryQuery(event.target.value)}
            placeholder="Search the glossary…"
            className="w-64 rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
          <select
            value={glossaryCategory}
            onChange={(event) => setGlossaryCategory(event.target.value)}
            className="rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none"
          >
            <option value="all">All categories</option>
            {glossaryCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {terms.map((entry) => (
            <div key={entry.term} className="panel p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">{entry.term}</h3>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {entry.category}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {entry.definition}
              </p>
            </div>
          ))}
          {terms.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              No glossary entries match.
            </p>
          )}
        </div>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="headline text-xl">Connect it to the real thing</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Read a topic, then see it live: follow a driver through a race
          weekend, inspect the car's aerodynamic components, and watch the
          timing screens.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/race-centre"
            className="inline-flex items-center bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-racing-red-bright"
          >
            Open the Race Centre
          </Link>
          {drivers[2] && (
            <Link
              to="/grid/drivers/$driverId"
              params={{ driverId: drivers[2].id }}
              className="inline-flex items-center border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-muted-foreground/60"
            >
              {nationalityFlag(drivers[2].countryCode)} Follow {drivers[2].name}
            </Link>
          )}
          <Link
            to="/garage"
            className="inline-flex items-center border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-muted-foreground/60"
          >
            Explore a car
          </Link>
        </div>
      </section>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-sm border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors ${active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
    >
      {label}
    </button>
  );
}
