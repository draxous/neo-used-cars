import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, ChevronRight, Loader2, Plus, Search, Ship } from "lucide-react";
import AdminNewOrderDialog from "@/components/AdminNewOrderDialog";
import AdminOrderSheet from "@/components/AdminOrderSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/data/cars";
import { useIsAdmin } from "@/lib/admin";
import { AdminOrder, listOrdersForAdmin } from "@/lib/orders";
import { formatDate, shipmentStages, stageIndex } from "@/lib/userData";
import { cn } from "@/lib/utils";

const Orders = () => {
  const { isManager } = useIsAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("active");
  const [openId, setOpenId] = useState<string | null>(null);

  // /admin/orders?new=1&customer=<id> opens the dialog pre-filled — that's how
  // "Create order" on the customers page lands here.
  const creating = searchParams.get("new") === "1";
  const presetCustomer = searchParams.get("customer");

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      setOrders(await listOrdersForAdmin());
    } catch {
      setError("Couldn't load orders. Has supabase/schema.sql been run?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (stageFilter === "active" && order.stage === "arrived") return false;
      if (stageFilter !== "active" && stageFilter !== "all" && order.stage !== stageFilter) return false;
      if (!term) return true;
      return `${order.id} ${order.carId} ${order.carLabel ?? ""} ${order.customerName} ${order.customerEmail} ${order.vessel ?? ""} ${order.destination}`
        .toLowerCase()
        .includes(term);
    });
  }, [orders, search, stageFilter]);

  const inTransit = orders.filter((order) => order.stage !== "arrived").length;
  const openOrder = orders.find((order) => order.id === openId) ?? null;

  const setCreating = (open: boolean) => {
    const next = new URLSearchParams(searchParams);
    if (open) next.set("new", "1");
    else {
      next.delete("new");
      next.delete("customer");
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Customer <span className="text-primary">orders</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading…" : `${orders.length} in total · ${inTransit} still on the way`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Order, customer, vessel…"
              className="pl-8 w-56 h-9"
              aria-label="Search orders"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="h-9 w-[9rem]" aria-label="Filter by stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Not yet arrived</SelectItem>
              <SelectItem value="all">All orders</SelectItem>
              {shipmentStages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="h-9 gap-1.5" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            New order
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
          <Ship className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            {orders.length === 0 ? "No orders yet" : "Nothing matches that"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length === 0
              ? "Create one when a customer's payment lands."
              : "Try a different search or stage."}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-lg card-shadow divide-y divide-border">
          {visible.map((order) => {
            const index = stageIndex(order.stage);
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => setOpenId(order.id)}
                className="w-full text-left flex flex-wrap items-center gap-x-4 gap-y-2 p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="min-w-0 flex-1 basis-60">
                  <p className="font-medium text-sm text-foreground truncate">{order.carLabel}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    <span className="font-mono">{order.id}</span> · {order.customerName || order.customerEmail}
                    {order.destination && ` · to ${order.destination}`}
                  </p>
                </div>

                {/* Five dots: a tracker small enough for a list row */}
                <div className="flex items-center gap-1" aria-label={`Stage: ${shipmentStages[index].label}`}>
                  {shipmentStages.map((stage, i) => (
                    <span
                      key={stage.value}
                      className={cn("h-1.5 w-5 rounded-full", i <= index ? "bg-primary" : "bg-border")}
                    />
                  ))}
                </div>

                <Badge
                  variant={order.stage === "arrived" ? "secondary" : "default"}
                  className="w-24 justify-center font-normal"
                >
                  {shipmentStages[index].label}
                </Badge>

                <span className="text-xs text-muted-foreground w-28">
                  {order.etaDate ? `ETA ${formatDate(order.etaDate)}` : "No ETA yet"}
                </span>

                <span className="font-display font-semibold text-sm w-20 text-right tabular-nums">
                  {formatPrice(order.pricePaidUsd)}
                </span>

                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      )}

      <AdminOrderSheet
        order={openOrder}
        canDelete={isManager}
        onOpenChange={(open) => !open && setOpenId(null)}
        onChanged={() => void load(true)}
      />

      <AdminNewOrderDialog
        open={creating}
        onOpenChange={setCreating}
        customerId={presetCustomer}
        onCreated={(id) => {
          void load(true).then(() => setOpenId(id));
        }}
      />
    </div>
  );
};

export default Orders;
