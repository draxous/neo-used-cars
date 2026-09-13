import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gavel, Heart, LayoutGrid, List, Search } from "lucide-react";
import CarGrid from "@/components/CarGrid";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortKey, getCarById, listingTypeOf, sortOptions } from "@/data/cars";
import { useUserData } from "@/lib/userData";
import { cn } from "@/lib/utils";

const sorters: Record<SortKey | "saved", (a: ReturnType<typeof getCarById>, b: ReturnType<typeof getCarById>) => number> = {
  saved: () => 0,
  newest: (a, b) => (b?.arrivedAt ?? "").localeCompare(a?.arrivedAt ?? ""),
  "price-asc": (a, b) => (a?.priceUsd ?? 0) - (b?.priceUsd ?? 0),
  "price-desc": (a, b) => (b?.priceUsd ?? 0) - (a?.priceUsd ?? 0),
  "year-desc": (a, b) => (b?.year ?? 0) - (a?.year ?? 0),
  "year-asc": (a, b) => (a?.year ?? 0) - (b?.year ?? 0),
  "mileage-asc": (a, b) => (a?.mileageKm ?? 0) - (b?.mileageKm ?? 0),
  "auction-soon": (a, b) => (a?.auction?.date ?? "9999").localeCompare(b?.auction?.date ?? "9999"),
};

const Favorites = () => {
  const { favorites } = useUserData();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<SortKey | "saved">("saved");

  // Favourites are stored newest-first, so "saved" needs no sorting at all.
  const cars = useMemo(() => {
    const found = favorites.map((id) => getCarById(id)).filter(Boolean) as NonNullable<
      ReturnType<typeof getCarById>
    >[];
    return sort === "saved" ? found : [...found].sort(sorters[sort]);
  }, [favorites, sort]);

  const stockCount = cars.filter((car) => listingTypeOf(car) === "stock").length;
  const auctionCount = cars.length - stockCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Your <span className="text-primary">favourites</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {cars.length > 0
              ? `${stockCount} in stock${auctionCount > 0 ? ` · ${auctionCount} auction ${auctionCount === 1 ? "lot" : "lots"}` : ""} — saved to your account.`
              : "Tap the heart on any vehicle to keep it here."}
          </p>
        </div>

        {cars.length > 0 && (
          <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={(value) => setSort(value as SortKey | "saved")}>
              <SelectTrigger className="w-[180px] bg-card" aria-label="Sort favourites">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saved">Recently saved</SelectItem>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="hidden sm:flex items-center rounded-md border border-border overflow-hidden bg-card">
              {([
                { value: "grid", icon: LayoutGrid, label: "Grid view" },
                { value: "list", icon: List, label: "List view" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={view === option.value}
                  onClick={() => setView(option.value)}
                  className={cn(
                    "p-2 transition-colors",
                    view === option.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <option.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {cars.length > 0 ? (
        <CarGrid cars={cars} view={view} />
      ) : (
        <div className="bg-card rounded-lg card-shadow py-16 text-center">
          <Heart className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">No favourites yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-sm mx-auto">
            Save vehicles while you browse and compare them here — we'll tell you if one sells or
            an auction date moves.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link to="/search">
                <Search className="h-4 w-4" />
                Browse stock
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/search?type=auction">
                <Gavel className="h-4 w-4" />
                See auction lots
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
