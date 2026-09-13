import { Fragment, useCallback, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  Gavel,
  LayoutGrid,
  List,
  MessageSquareQuote,
  SlidersHorizontal,
  Warehouse,
  X,
} from "lucide-react";
import Layout from "@/components/Layout";
import CarGrid from "@/components/CarGrid";
import SearchSidebar from "@/components/SearchSidebar";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FacetKey,
  ListingType,
  engineBands,
  facetOptionLabel,
  facetTitles,
  filterCars,
  formatMileage,
  formatPrice,
  getMakeName,
  getModelName,
  sortOptionsFor,
} from "@/data/cars";
import {
  SearchState,
  activeFilterCount,
  buildSearchParams,
  defaultSearchState,
  facetKeysFor,
  parseSearchState,
  perPageOptions,
  toFilters,
} from "@/lib/carSearch";
import { cn } from "@/lib/utils";

/** One removable pill describing an active filter. */
interface Chip {
  label: string;
  clear: Partial<SearchState>;
}

const buildChips = (state: SearchState): Chip[] => {
  const chips: Chip[] = [];

  if (state.q) chips.push({ label: `"${state.q}"`, clear: { q: undefined } });

  if (state.make) {
    chips.push({
      label: getMakeName(state.make) ?? state.make,
      clear: { make: undefined, model: undefined },
    });
  }
  if (state.make && state.model) {
    chips.push({
      label: getModelName(state.make, state.model) ?? state.model,
      clear: { model: undefined },
    });
  }

  if (state.yearFrom || state.yearTo) {
    const label = state.yearFrom && state.yearTo
      ? `${state.yearFrom} – ${state.yearTo}`
      : state.yearFrom
        ? `From ${state.yearFrom}`
        : `Up to ${state.yearTo}`;
    chips.push({ label, clear: { yearFrom: undefined, yearTo: undefined } });
  }

  if (state.priceMin !== undefined || state.priceMax !== undefined) {
    const label = state.priceMin !== undefined && state.priceMax !== undefined
      ? `${formatPrice(state.priceMin)} – ${formatPrice(state.priceMax)}`
      : state.priceMin !== undefined
        ? `Over ${formatPrice(state.priceMin)}`
        : `Under ${formatPrice(state.priceMax!)}`;
    chips.push({ label, clear: { priceMin: undefined, priceMax: undefined } });
  }

  if (state.mileageMax !== undefined) {
    chips.push({
      label: `Under ${formatMileage(state.mileageMax)}`,
      clear: { mileageMax: undefined },
    });
  }

  if (state.engineMin !== undefined || state.engineMax !== undefined) {
    const band = engineBands.find(
      (entry) => entry.min === state.engineMin && entry.max === state.engineMax
    );
    chips.push({
      label: band?.label ?? "Engine size",
      clear: { engineMin: undefined, engineMax: undefined },
    });
  }

  facetKeysFor(state.listingType).forEach((facet: FacetKey) => {
    (state[facet] ?? []).forEach((value) => {
      chips.push({
        label:
          facet === "houses" ? `${facetTitles.houses}: ${value}` : facetOptionLabel(facet, value),
        clear: {
          [facet]: (state[facet] ?? []).filter((entry) => entry !== value),
        } as Partial<SearchState>,
      });
    });
  });

  return chips;
};

const Search = () => {
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => parseSearchState(params), [params]);
  const resultsTop = useRef<HTMLDivElement>(null);

  const results = useMemo(() => filterCars(toFilters(state), state.sort), [state]);

  /** Tab counts respect the current filters, so they read as "what I'd get over there". */
  const tabs = useMemo(() => {
    const filters = toFilters(state);
    return ([
      { value: "stock", label: "Stock Cars", hint: "Ready to ship" },
      { value: "auction", label: "Auction Cars", hint: "We bid for you" },
    ] as const).map((tab) => ({
      ...tab,
      // Counted the way `switchTab` behaves: the facet that belongs to the
      // other side is dropped, so the badge matches what you land on.
      count: filterCars({
        ...filters,
        listingType: tab.value,
        locations: tab.value === "stock" ? filters.locations : undefined,
        houses: tab.value === "auction" ? filters.houses : undefined,
      }).length,
    }));
  }, [state]);

  const totalPages = Math.max(1, Math.ceil(results.length / state.perPage));
  const page = Math.min(state.page, totalPages);
  const firstIndex = (page - 1) * state.perPage;
  const pageResults = results.slice(firstIndex, firstIndex + state.perPage);

  /** Patch the URL. Anything but paging returns to page 1 — the old offset is meaningless. */
  const update = useCallback(
    (patch: Partial<SearchState>) => {
      const next: SearchState = {
        ...state,
        ...patch,
        page: patch.page ?? 1,
      };
      setParams(buildSearchParams(next), { replace: false });
    },
    [state, setParams]
  );

  const goToPage = (target: number) => {
    update({ page: Math.min(Math.max(target, 1), totalPages) });
    resultsTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /**
   * Switching tabs keeps the shared filters but drops the ones that only exist
   * on one side (port vs auction house), plus a sort that no longer applies.
   */
  const switchTab = (listingType: ListingType) => {
    if (listingType === state.listingType) return;
    update({
      listingType,
      locations: undefined,
      houses: undefined,
      sort: state.sort === "auction-soon" && listingType === "stock" ? "newest" : state.sort,
    });
  };

  const reset = () =>
    setParams(buildSearchParams({ ...defaultSearchState, listingType: state.listingType }));

  const chips = buildChips(state);
  const isAuction = state.listingType === "auction";
  const filterCount = activeFilterCount(state);

  /** Page numbers to render: always first and last, plus a window around the current page. */
  const pageNumbers = useMemo(() => {
    const window = new Set<number>([1, totalPages, page - 1, page, page + 1]);
    return [...window].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  }, [page, totalPages]);

  const sidebar = (
    <SearchSidebar state={state} onChange={update} onReset={reset} />
  );

  return (
    <Layout>
      {/* Page head */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/stock-cars" className="hover:text-primary transition-colors">Buy</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Search</span>
          </nav>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            Search <span className="text-primary">Results</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            <span className="font-semibold text-foreground">{results.length}</span>{" "}
            {isAuction
              ? `${results.length === 1 ? "lot" : "lots"} match your criteria — we translate the auction sheet and bid on your behalf.`
              : `${results.length === 1 ? "vehicle" : "vehicles"} match your criteria — every unit inspected, priced FOB Japan and ready to ship.`}
          </p>

          {/* Stock vs auction — the two sides of the business */}
          <div role="tablist" aria-label="Listing type" className="flex gap-6 mt-5 -mb-px">
            {tabs.map((tab) => {
              const active = tab.value === state.listingType;
              return (
                <button
                  key={tab.value}
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchTab(tab.value)}
                  className={cn(
                    "group pb-3 border-b-2 transition-colors text-left",
                    active
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  )}
                >
                  <span
                    className={cn(
                      "font-display font-semibold flex items-center gap-2",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {tab.value === "auction" ? (
                      <Gavel className="h-4 w-4" />
                    ) : (
                      <Warehouse className="h-4 w-4" />
                    )}
                    {tab.label}
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] leading-none font-medium",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {tab.count}
                    </span>
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{tab.hint}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
          {/* Sticky within its grid area, and independently scrollable when the
              filter list runs longer than the viewport. */}
          <div className="hidden lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            {sidebar}
          </div>

          <div ref={resultsTop} className="min-w-0">
            {/* Toolbar */}
            <div className="bg-card rounded-lg card-shadow p-3 mb-4 flex flex-wrap items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {filterCount > 0 && (
                      <span className="rounded-full bg-primary text-primary-foreground text-[11px] px-1.5 py-0.5 leading-none">
                        {filterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-sm overflow-y-auto">
                  <SheetHeader className="text-left mb-2">
                    <SheetTitle className="font-display text-xl">Filters</SheetTitle>
                    <SheetDescription>
                      {results.length}{" "}
                      {isAuction
                        ? results.length === 1 ? "lot" : "lots"
                        : results.length === 1 ? "vehicle" : "vehicles"}{" "}
                      match right now.
                    </SheetDescription>
                  </SheetHeader>
                  <SearchSidebar state={state} onChange={update} onReset={reset} bare />
                </SheetContent>
              </Sheet>

              <p className="text-sm text-muted-foreground mr-auto">
                {results.length > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {firstIndex + 1}–{firstIndex + pageResults.length}
                    </span>{" "}
                    of <span className="font-semibold text-foreground">{results.length}</span>
                  </>
                ) : (
                  "No matches"
                )}
              </p>

              <Select
                value={String(state.perPage)}
                onValueChange={(value) => update({ perPage: Number(value) })}
              >
                <SelectTrigger className="w-[110px] hidden sm:flex" aria-label="Results per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {perPageOptions.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={state.sort}
                onValueChange={(value) => update({ sort: value as SearchState["sort"] })}
              >
                <SelectTrigger className="w-[190px]" aria-label="Sort results">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptionsFor(state.listingType).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="hidden sm:flex items-center rounded-md border border-border overflow-hidden">
                {([
                  { value: "grid", icon: LayoutGrid, label: "Grid view" },
                  { value: "list", icon: List, label: "List view" },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={state.view === option.value}
                    onClick={() => update({ view: option.value, page })}
                    className={cn(
                      "p-2 transition-colors",
                      state.view === option.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <option.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Active filters */}
            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {chips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => update(chip.clear)}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1 text-xs font-medium"
                  >
                    {chip.label}
                    <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            )}

            <CarGrid
              cars={pageResults}
              view={state.view}
              emptyMessage={
                isAuction
                  ? "No upcoming lots match yet — new sheets land every week. Tell us what you're after and we'll watch for it."
                  : "Try widening your filters, or check the auction tab — we can bid on one for you."
              }
            />

            {/* Nothing found — offer the sourcing route rather than a dead end */}
            {results.length === 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Button onClick={reset} variant="outline" className="gap-2">
                  Clear all filters
                </Button>
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                  <Link to="/inquiry">
                    <MessageSquareQuote className="h-4 w-4" />
                    Request this vehicle
                  </Link>
                </Button>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/search?${buildSearchParams({ ...state, page: page - 1 })}`}
                      aria-disabled={page === 1}
                      className={cn(page === 1 && "pointer-events-none opacity-50")}
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(page - 1);
                      }}
                    />
                  </PaginationItem>

                  {pageNumbers.map((number, index) => (
                    <Fragment key={number}>
                      {index > 0 && number - pageNumbers[index - 1] > 1 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href={`/search?${buildSearchParams({ ...state, page: number })}`}
                          isActive={number === page}
                          onClick={(event) => {
                            event.preventDefault();
                            goToPage(number);
                          }}
                        >
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    </Fragment>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href={`/search?${buildSearchParams({ ...state, page: page + 1 })}`}
                      aria-disabled={page === totalPages}
                      className={cn(page === totalPages && "pointer-events-none opacity-50")}
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(page + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Search;
