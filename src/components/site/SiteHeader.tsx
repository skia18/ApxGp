import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { SearchDialog } from "@/components/site/SearchDialog";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/race-centre", label: "Race Centre" },
  { to: "/grid", label: "The Grid" },
  { to: "/garage", label: "The Garage" },
  { to: "/learn", label: "Learn F1" },
  { to: "/history", label: "History & Records" },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground rounded-[4px]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19 L20 5" />
          <path d="M14 5 H20 V11" />
        </svg>
      </span>
      {!compact && (
        <span className="headline text-lg tracking-tight">
          Apex<span className="text-primary"> F1</span>
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <BrandMark />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 text-[13px] font-semibold tracking-wide uppercase transition-colors rounded-sm ${
                  isActive(item.to)
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-md border border-input bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors"
            aria-label="Global search"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="pr-6">Search drivers, teams, cars…</span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 text-foreground"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-border bg-background px-4 py-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-3 text-sm font-semibold uppercase tracking-wide border-l-2 ${
                isActive(item.to)
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
