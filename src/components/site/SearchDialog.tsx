import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { drivers } from "@/data/drivers";
import { constructors } from "@/data/constructors";
import { cars } from "@/data/cars";
import { circuits } from "@/data/circuits";
import { calendar } from "@/data/calendar";
import { nationalityFlag } from "@/data/drivers";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const results = [
    {
      heading: "Drivers",
      items: drivers.map((d) => ({
        label: `${nationalityFlag(d.countryCode)} ${d.name} · #${d.number}`,
        path: `/grid/drivers/${d.id}`,
        keywords: [d.abbreviation, d.nationality],
      })),
    },
    {
      heading: "Constructors",
      items: constructors.map((c) => ({
        label: c.name,
        path: `/grid/constructors/${c.id}`,
        keywords: [c.engineSupplier],
      })),
    },
    {
      heading: "Cars",
      items: cars.map((c) => ({
        label: `${c.designation} · ${c.season}`,
        path: `/garage/${c.id}`,
        keywords: [c.teamId],
      })),
    },
    {
      heading: "Circuits",
      items: circuits.map((c) => ({
        label: `${c.name} · ${c.locality}`,
        path: `/race-centre`,
        keywords: [c.country],
      })),
    },
    {
      heading: "Races",
      items: calendar.map((r) => ({
        label: `R${r.round} · ${r.name}`,
        path: `/race-centre`,
        keywords: [r.country, r.location],
      })),
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search drivers, teams, cars, circuits and seasons…" />
      <CommandList>
        <CommandEmpty>
          No results. Sample data covers the current season.
        </CommandEmpty>
        {results.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.items.map((item) => (
              <CommandItem
                key={item.path + item.label}
                keywords={item.keywords}
                onSelect={() => {
                  navigate({ to: item.path });
                  onOpenChange(false);
                }}
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
