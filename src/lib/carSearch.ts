/**
 * URL <-> search state codec for /search.
 *
 * The query string is the single source of truth for the search page: every
 * filter, the sort order, the view mode and the page number live there, so a
 * result set can be bookmarked, shared and re-entered from anywhere on the
 * site (the home search box just builds one of these URLs).
 */
import { CarFilters, FacetKey, ListingType, SortKey, sortOptions } from "@/data/cars";

export type ViewMode = "grid" | "list";

export interface SearchState extends CarFilters {
  listingType: ListingType;
  sort: SortKey;
  view: ViewMode;
  page: number;
  perPage: number;
}

/** Query-string key for each multi-select facet — short, human-readable URLs. */
export const facetParams: Record<FacetKey, string> = {
  bodyTypes: "body",
  fuels: "fuel",
  transmissions: "transmission",
  drives: "drive",
  steerings: "steering",
  colors: "color",
  locations: "port",
  houses: "house",
};

export const facetKeys = Object.keys(facetParams) as FacetKey[];

/**
 * Facets worth showing for a listing type — a port only applies to stock we
 * already hold, an auction house only to a lot we would bid on.
 */
export const facetKeysFor = (type: ListingType): FacetKey[] =>
  facetKeys.filter((key) =>
    key === "locations" ? type === "stock" : key === "houses" ? type === "auction" : true
  );

export const perPageOptions = [12, 24, 48] as const;

export const defaultSearchState: SearchState = {
  listingType: "stock",
  sort: "newest",
  view: "grid",
  page: 1,
  perPage: 24,
};

const numberParam = (params: URLSearchParams, key: string): number | undefined => {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
};

const listParam = (params: URLSearchParams, key: string): string[] | undefined => {
  const raw = params.get(key);
  if (!raw) return undefined;
  const values = raw.split(",").map((value) => value.trim()).filter(Boolean);
  return values.length ? values : undefined;
};

export const parseSearchState = (params: URLSearchParams): SearchState => {
  const sort = params.get("sort") as SortKey | null;
  const view = params.get("view");
  const page = numberParam(params, "page") ?? 1;
  const perPage = numberParam(params, "perPage") ?? defaultSearchState.perPage;

  const state: SearchState = {
    listingType: params.get("type") === "auction" ? "auction" : "stock",
    make: params.get("make") ?? undefined,
    model: params.get("model") ?? undefined,
    q: params.get("q") ?? undefined,
    collection: params.get("collection") ?? undefined,
    yearFrom: numberParam(params, "yearFrom"),
    yearTo: numberParam(params, "yearTo"),
    priceMin: numberParam(params, "priceMin"),
    priceMax: numberParam(params, "priceMax"),
    mileageMax: numberParam(params, "mileageMax"),
    engineMin: numberParam(params, "engineMin"),
    engineMax: numberParam(params, "engineMax"),
    sort: sortOptions.some((option) => option.value === sort) ? (sort as SortKey) : "newest",
    view: view === "list" ? "list" : "grid",
    page: page >= 1 ? Math.floor(page) : 1,
    perPage: (perPageOptions as readonly number[]).includes(perPage)
      ? perPage
      : defaultSearchState.perPage,
  };

  facetKeys.forEach((key) => {
    state[key] = listParam(params, facetParams[key]);
  });

  return state;
};

/** Serialises state back to a query string, omitting anything left at its default. */
export const buildSearchParams = (state: SearchState): URLSearchParams => {
  const params = new URLSearchParams();

  const setIf = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  };

  if (state.listingType !== defaultSearchState.listingType) params.set("type", state.listingType);
  setIf("q", state.q?.trim());
  setIf("make", state.make);
  setIf("model", state.model);
  setIf("collection", state.collection);
  setIf("yearFrom", state.yearFrom);
  setIf("yearTo", state.yearTo);
  setIf("priceMin", state.priceMin);
  setIf("priceMax", state.priceMax);
  setIf("mileageMax", state.mileageMax);
  setIf("engineMin", state.engineMin);
  setIf("engineMax", state.engineMax);

  facetKeys.forEach((key) => {
    const values = state[key];
    if (values?.length) params.set(facetParams[key], values.join(","));
  });

  if (state.sort !== defaultSearchState.sort) params.set("sort", state.sort);
  if (state.view !== defaultSearchState.view) params.set("view", state.view);
  if (state.perPage !== defaultSearchState.perPage) params.set("perPage", String(state.perPage));
  if (state.page > 1) params.set("page", String(state.page));

  return params;
};

/** The filter half of the state — what `filterCars` and the facet counts need. */
export const toFilters = (state: SearchState): CarFilters => {
  const { sort, view, page, perPage, ...filters } = state;
  return filters;
};

/** Filters that are actually narrowing the result set. */
export const activeFilterCount = (state: SearchState): number => {
  const { listingType, ...filters } = toFilters(state);
  return Object.values(filters).filter((value) =>
    Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ""
  ).length;
};
