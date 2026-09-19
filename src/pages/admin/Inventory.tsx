import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertCircle,
  Car as CarIcon,
  Copy,
  ExternalLink,
  EyeOff,
  Gavel,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car,
  SaleStatus,
  carPath,
  formatMileage,
  formatPrice,
  listingTypeOf,
  setInventory,
} from "@/data/cars";
import { useIsAdmin } from "@/lib/admin";
import { deleteVehicle, fetchInventory, patchVehicle, saleStatuses } from "@/lib/inventory";
import { cn } from "@/lib/utils";

const statusTone: Record<SaleStatus, string> = {
  available: "border-primary/30 bg-primary/10 text-primary",
  reserved: "border-accent/40 bg-accent/10 text-accent-foreground",
  sold: "border-border bg-muted text-muted-foreground",
};

type View = "all" | SaleStatus | "hidden" | "auction";

const views: { value: View; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "hidden", label: "Hidden drafts" },
  { value: "auction", label: "Auction lots" },
];

const Inventory = () => {
  const navigate = useNavigate();
  const { isManager } = useIsAdmin();
  const [list, setList] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("all");
  const [deleting, setDeleting] = useState<Car | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchInventory();
      setList(next);
      setInventory(next);
    } catch {
      setError("Couldn't load the inventory. Has supabase/schema.sql been run?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Applies a change locally and to the live site list in one go. */
  const replace = (next: Car[]) => {
    setList(next);
    setInventory(next);
  };

  /** Optimistic quick edit; puts the old value back if the write fails. */
  const quickEdit = async (car: Car, patch: Partial<Pick<Car, "status" | "published" | "featured">>) => {
    const before = list;
    replace(list.map((item) => (item.id === car.id ? { ...item, ...patch } : item)));
    try {
      await patchVehicle(car.id, patch);
    } catch (issue) {
      replace(before);
      toast.error(issue instanceof Error ? issue.message : "Couldn't save that change");
    }
  };

  const counts = useMemo(
    () => ({
      available: list.filter((car) => car.status === "available" && car.published !== false).length,
      reserved: list.filter((car) => car.status === "reserved").length,
      sold: list.filter((car) => car.status === "sold").length,
      hidden: list.filter((car) => car.published === false).length,
    }),
    [list]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return list.filter((car) => {
      if (view === "hidden" && car.published !== false) return false;
      if (view === "auction" && listingTypeOf(car) !== "auction") return false;
      if (saleStatuses.includes(view as SaleStatus) && car.status !== view) return false;
      if (!term) return true;
      return `${car.id} ${car.year} ${car.make} ${car.model} ${car.grade ?? ""} ${car.color} ${car.chassisCode ?? ""}`
        .toLowerCase()
        .includes(term);
    });
  }, [list, search, view]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            <span className="text-primary">Inventory</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Loading…"
              : `${counts.available} available · ${counts.reserved} reserved · ${counts.sold} sold` +
                (counts.hidden ? ` · ${counts.hidden} hidden` : "")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Stock no, make, model…"
              className="pl-8 w-56 h-9"
              aria-label="Search inventory"
            />
          </div>
          <Select value={view} onValueChange={(value) => setView(value as View)}>
            <SelectTrigger className="h-9 w-[9.5rem]" aria-label="Show">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {views.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild className="h-9 gap-1.5">
            <Link to="/admin/inventory/new">
              <Plus className="h-4 w-4" />
              Add vehicle
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="sr-only">Loading</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-card rounded-lg card-shadow py-16 text-center">
          <CarIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            {list.length === 0 ? "No vehicles yet" : "Nothing matches that"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {list.length === 0
              ? "Add your first car, or run supabase/seed_vehicles.sql to bring in the starting stock."
              : "Try a different search or view."}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-lg card-shadow divide-y divide-border">
          {visible.map((car) => {
            const status = car.status ?? "available";
            const hidden = car.published === false;
            return (
              <div
                key={car.id}
                className={cn("flex flex-wrap items-center gap-3 sm:gap-4 p-3", hidden && "bg-muted/40")}
              >
                <Link to={`/admin/inventory/${car.id}`} className="flex items-center gap-3 min-w-0 flex-1 basis-64">
                  {car.images[0] ? (
                    <img
                      src={car.images[0]}
                      alt=""
                      className={cn("h-14 w-20 rounded object-cover flex-shrink-0", hidden && "opacity-60")}
                    />
                  ) : (
                    <span className="h-14 w-20 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <CarIcon className="h-5 w-5 text-muted-foreground/60" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 font-medium text-sm text-foreground">
                      <span className="truncate">
                        {car.year} {car.make} {car.model}
                      </span>
                      {car.auction && <Gavel className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" aria-label="Auction lot" />}
                      {hidden && <EyeOff className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" aria-label="Hidden" />}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      <span className="font-mono">{car.id}</span>
                      {car.grade && ` · ${car.grade}`} · {formatMileage(car.mileageKm)}
                    </span>
                  </span>
                </Link>

                <span className="font-display font-semibold text-sm text-foreground w-20 text-right tabular-nums">
                  {formatPrice(car.priceUsd)}
                </span>

                <Select
                  value={status}
                  onValueChange={(value) => void quickEdit(car, { status: value as SaleStatus })}
                >
                  <SelectTrigger
                    className={cn("h-8 w-[7.5rem] text-xs capitalize", statusTone[status])}
                    aria-label={`Status of ${car.id}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {saleStatuses.map((option) => (
                      <SelectItem key={option} value={option} className="text-xs capitalize">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <Switch
                    checked={!hidden}
                    onCheckedChange={(checked) => void quickEdit(car, { published: checked })}
                    aria-label={`Show ${car.id} on the site`}
                  />
                  <span className="w-12">{hidden ? "Hidden" : "On site"}</span>
                </label>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => void quickEdit(car, { featured: !car.featured })}
                  aria-label={car.featured ? `Unfeature ${car.id}` : `Feature ${car.id} on the home page`}
                  title={car.featured ? "Featured on the home page" : "Feature on the home page"}
                >
                  <Star
                    className={cn("h-4 w-4", car.featured ? "fill-accent text-accent" : "text-muted-foreground")}
                  />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`More for ${car.id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/admin/inventory/${car.id}`)} className="gap-2">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate(`/admin/inventory/new?from=${encodeURIComponent(car.id)}`)}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="gap-2">
                      <a href={carPath(car)} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        View on site
                      </a>
                    </DropdownMenuItem>
                    {isManager && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleting(car)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      {!loading && list.length > 0 && (
        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" /> Featured on the home page
          </span>
          <span className="inline-flex items-center gap-1">
            <Gavel className="h-3.5 w-3.5" /> Auction lot
          </span>
          <span>Sold cars stay reachable from customers' orders but leave every listing.</span>
        </p>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.id ?? "this vehicle"}?`}
        description={
          deleting && (
            <>
              The {deleting.year} {deleting.make} {deleting.model} and its uploaded photos will be
              removed for good, and its page will stop working. To take it off the site for now,
              switch it to <Badge variant="secondary">Hidden</Badge> instead.
            </>
          )
        }
        confirmLabel="Delete vehicle"
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteVehicle(deleting);
            replace(list.filter((car) => car.id !== deleting.id));
            toast.success(`${deleting.id} deleted`);
          } catch (issue) {
            toast.error(issue instanceof Error ? issue.message : "Couldn't delete that vehicle");
            throw issue;
          }
        }}
      />
    </div>
  );
};

export default Inventory;
