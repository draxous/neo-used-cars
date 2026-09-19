import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Car, formatPrice } from "@/data/cars";
import { AdminCustomer, listCustomers } from "@/lib/admin";
import { fetchInventory } from "@/lib/inventory";
import { createOrder } from "@/lib/orders";
import { cn } from "@/lib/utils";

interface AdminNewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-selects a customer — used by "Create order" on /admin/customers. */
  customerId?: string | null;
  onCreated: (orderId: string) => void;
}

/** A short scrollable pick-list with a filter box on top. */
function PickList<T>({
  label,
  items,
  selected,
  onSelect,
  render,
  match,
  placeholder,
}: {
  label: string;
  items: T[];
  selected: T | null;
  onSelect: (item: T) => void;
  render: (item: T) => React.ReactNode;
  match: (item: T, term: string) => boolean;
  placeholder: string;
}) {
  const [term, setTerm] = useState("");
  const visible = items.filter((item) => match(item, term.trim().toLowerCase())).slice(0, 50);

  return (
    <div>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="relative mt-1.5">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={placeholder}
          className="pl-8"
          aria-label={`Search ${label.toLowerCase()}`}
        />
      </div>
      <ul className="mt-1.5 max-h-40 overflow-y-auto rounded-md border border-border divide-y divide-border">
        {visible.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">No matches</li>}
        {visible.map((item, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-secondary",
                selected === item && "bg-primary/10"
              )}
            >
              <span className="flex-1 min-w-0">{render(item)}</span>
              {selected === item && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Records a sale once payment lands: who bought, which car, for how much.
 * The order then appears on the customer's My Vehicles at "Purchased".
 */
const AdminNewOrderDialog = ({ open, onOpenChange, customerId, onCreated }: AdminNewOrderDialogProps) => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [stock, setStock] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);

  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [price, setPrice] = useState("");
  const [destination, setDestination] = useState("");
  const [purchasedAt, setPurchasedAt] = useState(today());
  const [markSold, setMarkSold] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCustomer(null);
    setCar(null);
    setPrice("");
    setDestination("");
    setPurchasedAt(today());
    setMarkSold(true);

    setLoading(true);
    Promise.all([listCustomers(), fetchInventory()])
      .then(([people, cars]) => {
        setCustomers(people);
        // Anything not already sold can be sold.
        setStock(cars.filter((item) => item.status !== "sold"));
        const preset = customerId ? people.find((person) => person.userId === customerId) : undefined;
        if (preset) {
          setCustomer(preset);
          setDestination(preset.country);
        }
      })
      .catch(() => toast.error("Couldn't load customers and stock"))
      .finally(() => setLoading(false));
  }, [open, customerId]);

  const carLabel = useMemo(
    () => (car ? `${car.year} ${car.make} ${car.model}${car.grade ? ` ${car.grade}` : ""}` : ""),
    [car]
  );

  const pickCar = (next: Car) => {
    setCar(next);
    setPrice(String(next.priceUsd));
  };

  const pickCustomer = (next: AdminCustomer) => {
    setCustomer(next);
    if (!destination.trim()) setDestination(next.country);
  };

  const submit = async () => {
    if (!customer || !car) {
      toast.error("Pick the customer and the car");
      return;
    }
    if (!/^\d+$/.test(price.trim())) {
      toast.error("Price must be a whole number of dollars");
      return;
    }
    setSaving(true);
    try {
      const id = await createOrder({
        userId: customer.userId,
        carId: car.id,
        carLabel,
        priceUsd: Number(price),
        destination,
        purchasedAt: new Date(`${purchasedAt}T12:00:00`).toISOString(),
        markSold,
      });
      toast.success(`Order ${id} created`, {
        description: `${customer.name || customer.email} can now follow it on My Vehicles.`,
      });
      onOpenChange(false);
      onCreated(id);
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Couldn't create that order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">New order</DialogTitle>
          <DialogDescription>
            Record a sale once payment is in. The customer sees it straight away on My Vehicles.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <PickList
              label="Customer"
              items={customers}
              selected={customer}
              onSelect={pickCustomer}
              placeholder="Name or email"
              match={(person, term) =>
                !term || `${person.name} ${person.email} ${person.country}`.toLowerCase().includes(term)
              }
              render={(person) => (
                <>
                  <span className="font-medium">{person.name || "No name"}</span>
                  <span className="text-muted-foreground"> · {person.email}</span>
                  {person.country && <span className="text-muted-foreground"> · {person.country}</span>}
                </>
              )}
            />
            {customers.length === 0 && (
              <p className="text-xs text-muted-foreground">
                The buyer needs an account first — ask them to register on the site.
              </p>
            )}

            <PickList
              label="Vehicle"
              items={stock}
              selected={car}
              onSelect={pickCar}
              placeholder="Stock number, make or model"
              match={(item, term) =>
                !term || `${item.id} ${item.year} ${item.make} ${item.model}`.toLowerCase().includes(term)
              }
              render={(item) => (
                <>
                  <span className="font-mono text-xs text-muted-foreground">{item.id}</span>{" "}
                  <span className="font-medium">
                    {item.year} {item.make} {item.model}
                  </span>
                  <span className="text-muted-foreground"> · {formatPrice(item.priceUsd)}</span>
                  {item.status === "reserved" && <span className="text-accent"> · reserved</span>}
                </>
              )}
            />

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="new-order-price" className="text-xs font-medium">
                  Price paid (USD)
                </Label>
                <Input
                  id="new-order-price"
                  inputMode="numeric"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="new-order-date" className="text-xs font-medium">
                  Payment date
                </Label>
                <Input
                  id="new-order-date"
                  type="date"
                  value={purchasedAt}
                  onChange={(event) => setPurchasedAt(event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="new-order-dest" className="text-xs font-medium">
                  Destination
                </Label>
                <Input
                  id="new-order-dest"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="Port or country"
                  className="mt-1.5"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={markSold} onCheckedChange={(checked) => setMarkSold(checked === true)} />
              Mark {car?.id ?? "the car"} as sold, so it leaves the listings
            </label>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || loading || !customer || !car} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminNewOrderDialog;
