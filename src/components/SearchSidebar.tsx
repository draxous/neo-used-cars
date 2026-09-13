import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Search as SearchIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CarFilters,
  FacetKey,
  engineBands,
  facetTitles,
  formatPrice,
  getFacetOptions,
  getMakes,
  getModels,
  getYearRange,
  mileageBands,
  priceLadder,
} from "@/data/cars";
import { SearchState, facetKeysFor, toFilters } from "@/lib/carSearch";
import { cn } from "@/lib/utils";

const ANY = "any";

/** Swatch colours for the colour facet — keyed by colour family. */
const swatches: Record<string, string> = {
  white: "#f8fafc",
  black: "#111827",
  silver: "#cbd5e1",
  grey: "#64748b",
  blue: "#2563eb",
  red: "#dc2626",
  green: "#16a34a",
  brown: "#92400e",
  yellow: "#eab308",
  other: "#a1a1aa",
};

interface FacetSectionProps {
  facet: FacetKey;
  filters: CarFilters;
  selected: string[];
  onToggle: (value: string, checked: boolean) => void;
}

/** A checkbox list for one facet, with live counts and a show-all toggle. */
const FacetSection = ({ facet, filters, selected, onToggle }: FacetSectionProps) => {
  const options = useMemo(() => getFacetOptions(facet, filters), [facet, filters]);
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? options : options.slice(0, 6);

  return (
    <AccordionItem value={facet} className="border-border">
      <AccordionTrigger className="text-sm font-semibold hover:no-underline">
        {facetTitles[facet]}
        {selected.length > 0 && (
          <span className="ml-auto mr-2 text-xs font-medium text-primary">
            {selected.length}
          </span>
        )}
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-1.5 pt-1">
          {visible.map((option) => {
            const id = `${facet}-${option.value}`;
            const checked = selected.includes(option.value);
            return (
              <li key={option.value}>
                <label
                  htmlFor={id}
                  className={cn(
                    "flex items-center gap-2.5 py-1 text-sm cursor-pointer transition-colors",
                    option.count === 0 && !checked
                      ? "text-muted-foreground/50"
                      : "text-foreground hover:text-primary"
                  )}
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(value) => onToggle(option.value, value === true)}
                  />
                  {facet === "colors" && (
                    <span
                      aria-hidden
                      className="h-3.5 w-3.5 rounded-full border border-border flex-shrink-0"
                      style={{ backgroundColor: swatches[option.value] ?? swatches.other }}
                    />
                  )}
                  <span className="flex-1 leading-tight">{option.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {option.count}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {options.length > 6 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            {expanded ? "Show less" : `Show all ${options.length}`}
          </button>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

interface SearchSidebarProps {
  state: SearchState;
  onChange: (patch: Partial<SearchState>) => void;
  onReset: () => void;
  /** Rendered inside the mobile sheet — drops the sticky card chrome. */
  bare?: boolean;
}

const SearchSidebar = ({ state, onChange, onReset, bare = false }: SearchSidebarProps) => {
  const makes = useMemo(() => getMakes(state.listingType), [state.listingType]);
  const years = useMemo(getYearRange, []);
  const models = state.make ? getModels(state.make, state.listingType) : [];
  const filters = toFilters(state);

  // The keyword box is uncontrolled between keystrokes so typing stays snappy;
  // it commits on Enter or blur, and re-syncs when the URL changes elsewhere.
  const [keyword, setKeyword] = useState(state.q ?? "");
  useEffect(() => setKeyword(state.q ?? ""), [state.q]);

  const commitKeyword = () => {
    const value = keyword.trim();
    if (value !== (state.q ?? "")) onChange({ q: value || undefined });
  };

  const toggleFacet = (facet: FacetKey, value: string, checked: boolean) => {
    const current = state[facet] ?? [];
    const next = checked
      ? [...current, value]
      : current.filter((entry) => entry !== value);
    onChange({ [facet]: next.length ? next : undefined } as Partial<SearchState>);
  };

  const engineValue =
    engineBands.find(
      (band) => band.min === state.engineMin && band.max === state.engineMax
    )?.value ?? ANY;

  return (
    <aside
      className={cn(
        !bare && "bg-card rounded-lg card-shadow p-5",
        bare && "pb-6"
      )}
    >
      {/* In the mobile sheet the drawer already has a "Filters" title, so only
          the reset control is repeated there. */}
      <div
        className={cn(
          "flex items-center gap-2 pb-4 mb-2 border-b border-border",
          bare ? "justify-end" : "justify-between"
        )}
      >
        {!bare && (
          <h2 className="font-display font-semibold text-foreground">
            Refine <span className="text-primary">Search</span>
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onBlur={commitKeyword}
          onKeyDown={(event) => event.key === "Enter" && commitKeyword()}
          placeholder="Stock ID or keyword"
          aria-label="Keyword"
          className="pl-9"
        />
      </div>

      <Accordion
        type="multiple"
        defaultValue={["vehicle", "price", "year", "bodyTypes"]}
        className="w-full"
      >
        <AccordionItem value="vehicle" className="border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Make &amp; Model
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-1">
            <Select
              value={state.make ?? ANY}
              onValueChange={(value) =>
                onChange({ make: value === ANY ? undefined : value, model: undefined })
              }
            >
              <SelectTrigger aria-label="Make">
                <SelectValue placeholder="All Makes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All Makes</SelectItem>
                {makes.map((make) => (
                  <SelectItem key={make.slug} value={make.slug}>
                    {make.name} ({make.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={state.model ?? ANY}
              onValueChange={(value) => onChange({ model: value === ANY ? undefined : value })}
              disabled={!state.make}
            >
              <SelectTrigger aria-label="Model">
                <SelectValue placeholder={state.make ? "All Models" : "Select a make first"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All Models</SelectItem>
                {models.map((model) => (
                  <SelectItem key={model.slug} value={model.slug}>
                    {model.name} ({model.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            {state.listingType === "auction" ? "Estimate (USD)" : "Price (FOB)"}
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Select
                value={state.priceMin ? String(state.priceMin) : ANY}
                onValueChange={(value) =>
                  onChange({ priceMin: value === ANY ? undefined : Number(value) })
                }
              >
                <SelectTrigger aria-label="Minimum price">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value={ANY}>No min</SelectItem>
                  {priceLadder.map((amount) => (
                    <SelectItem key={amount} value={String(amount)}>
                      {formatPrice(amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={state.priceMax ? String(state.priceMax) : ANY}
                onValueChange={(value) =>
                  onChange({ priceMax: value === ANY ? undefined : Number(value) })
                }
              >
                <SelectTrigger aria-label="Maximum price">
                  <SelectValue placeholder="Max" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value={ANY}>No max</SelectItem>
                  {priceLadder.map((amount) => (
                    <SelectItem key={amount} value={String(amount)}>
                      {formatPrice(amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="year" className="border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Year
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Select
                value={state.yearFrom ? String(state.yearFrom) : ANY}
                onValueChange={(value) =>
                  onChange({ yearFrom: value === ANY ? undefined : Number(value) })
                }
              >
                <SelectTrigger aria-label="Year from">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value={ANY}>Any</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={state.yearTo ? String(state.yearTo) : ANY}
                onValueChange={(value) =>
                  onChange({ yearTo: value === ANY ? undefined : Number(value) })
                }
              >
                <SelectTrigger aria-label="Year to">
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value={ANY}>Any</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mileage" className="border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Mileage
          </AccordionTrigger>
          <AccordionContent>
            <Select
              value={state.mileageMax ? String(state.mileageMax) : ANY}
              onValueChange={(value) =>
                onChange({ mileageMax: value === ANY ? undefined : Number(value) })
              }
            >
              <SelectTrigger aria-label="Maximum mileage" className="mt-1">
                <SelectValue placeholder="Any mileage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any mileage</SelectItem>
                {mileageBands.map((band) => (
                  <SelectItem key={band.value} value={band.value}>
                    {band.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="engine" className="border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Engine
          </AccordionTrigger>
          <AccordionContent>
            <Select
              value={engineValue}
              onValueChange={(value) => {
                const band = engineBands.find((entry) => entry.value === value);
                onChange({ engineMin: band?.min, engineMax: band?.max });
              }}
            >
              <SelectTrigger aria-label="Engine size" className="mt-1">
                <SelectValue placeholder="Any size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any size</SelectItem>
                {engineBands.map((band) => (
                  <SelectItem key={band.value} value={band.value}>
                    {band.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        {facetKeysFor(state.listingType).map((facet) => (
          <FacetSection
            key={facet}
            facet={facet}
            filters={filters}
            selected={state[facet] ?? []}
            onToggle={(value, checked) => toggleFacet(facet, value, checked)}
          />
        ))}
      </Accordion>
    </aside>
  );
};

export default SearchSidebar;
