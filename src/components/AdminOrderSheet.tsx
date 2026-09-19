import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, Mail, Plus, Save, Trash2, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import ShipmentTracker from "@/components/ShipmentTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice } from "@/data/cars";
import {
  AdminOrder,
  OrderUpdate,
  addOrderNote,
  defaultStageLabels,
  deleteOrder,
  listOrderUpdates,
  removeOrderUpdate,
  setOrderStage,
  updateOrderDetails,
} from "@/lib/orders";
import { ShipmentStage, formatDate, shipmentStages, stageIndex } from "@/lib/userData";
import { cn } from "@/lib/utils";

interface AdminOrderSheetProps {
  order: AdminOrder | null;
  canDelete: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after any change, so the list behind the sheet can reload. */
  onChanged: () => void;
}

/**
 * Everything about one order: move it through the stages, keep the vessel and
 * ETA current, and curate the timeline the customer reads on My Vehicles.
 */
const AdminOrderSheet = ({ order, canDelete, onOpenChange, onChanged }: AdminOrderSheetProps) => {
  const [updates, setUpdates] = useState<OrderUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  const [stage, setStage] = useState<ShipmentStage>("purchased");
  const [pendingStage, setPendingStage] = useState<ShipmentStage | null>(null);
  const [stageLabel, setStageLabel] = useState("");
  const [savingStage, setSavingStage] = useState(false);

  const [details, setDetails] = useState({ destination: "", vessel: "", etaDate: "", price: "" });
  const [savingDetails, setSavingDetails] = useState(false);

  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadUpdates = useCallback(async (orderId: string) => {
    setLoadingUpdates(true);
    try {
      setUpdates(await listOrderUpdates(orderId));
    } catch {
      toast.error("Couldn't load this order's timeline");
    } finally {
      setLoadingUpdates(false);
    }
  }, []);

  useEffect(() => {
    if (!order) return;
    setStage(order.stage);
    setPendingStage(null);
    setStageLabel("");
    setNote("");
    setDetails({
      destination: order.destination,
      vessel: order.vessel ?? "",
      etaDate: order.etaDate?.slice(0, 10) ?? "",
      price: String(order.pricePaidUsd),
    });
    void loadUpdates(order.id);
  }, [order, loadUpdates]);

  if (!order) return null;

  const applyStage = async () => {
    if (!pendingStage) return;
    setSavingStage(true);
    try {
      await setOrderStage(order.id, pendingStage, stageLabel);
      setStage(pendingStage);
      setPendingStage(null);
      setStageLabel("");
      toast.success(`Moved to ${shipmentStages[stageIndex(pendingStage)].label}`, {
        description: "The customer sees it on My Vehicles now.",
      });
      void loadUpdates(order.id);
      onChanged();
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Couldn't change the stage");
    } finally {
      setSavingStage(false);
    }
  };

  const saveDetails = async () => {
    if (!/^\d+$/.test(details.price.trim())) {
      toast.error("Price must be a whole number of dollars");
      return;
    }
    setSavingDetails(true);
    try {
      await updateOrderDetails(order.id, {
        destination: details.destination,
        vessel: details.vessel,
        etaDate: details.etaDate,
        pricePaidUsd: Number(details.price),
      });
      toast.success("Shipping details saved");
      onChanged();
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Couldn't save those details");
    } finally {
      setSavingDetails(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setSavingNote(true);
    try {
      await addOrderNote(order.id, note);
      setNote("");
      void loadUpdates(order.id);
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Couldn't add that update");
    } finally {
      setSavingNote(false);
    }
  };

  const removeUpdate = async (update: OrderUpdate) => {
    try {
      await removeOrderUpdate(update.id);
      setUpdates((current) => current.filter((item) => item.id !== update.id));
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Couldn't remove that update");
    }
  };

  const emailBody = [
    `Hello ${order.customerName || ""},`.trim(),
    "",
    `An update on your ${order.carLabel ?? "vehicle"} (order ${order.id}):`,
    `Status: ${shipmentStages[stageIndex(stage)].label}`,
    details.vessel ? `Vessel: ${details.vessel}` : null,
    details.etaDate ? `ETA: ${formatDate(details.etaDate)}` : null,
    "",
    "You can follow every step in your dashboard under My Vehicles.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return (
    <Sheet open={Boolean(order)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-xl">{order.carLabel}</SheetTitle>
          <SheetDescription className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-mono">{order.id}</span>
            <span>{order.customerName || order.customerEmail}</span>
            <span>Bought {formatDate(order.purchasedAt)}</span>
          </SheetDescription>
        </SheetHeader>

        {/* Stage */}
        <div className="mt-6">
          <ShipmentTracker stage={stage} compact />
          <p className="text-xs font-medium mt-5 mb-2">Move to stage</p>
          <div className="flex flex-wrap gap-1.5">
            {shipmentStages.map((entry) => (
              <Button
                key={entry.value}
                type="button"
                size="sm"
                variant={(pendingStage ?? stage) === entry.value ? "default" : "outline"}
                className="h-8"
                onClick={() => setPendingStage(entry.value === stage ? null : entry.value)}
              >
                {entry.value === stage && <Check className="h-3.5 w-3.5 mr-1" />}
                {entry.label}
              </Button>
            ))}
          </div>
          {pendingStage && (
            <div className="mt-3 rounded-md border border-border p-3 space-y-2">
              <Label htmlFor="stage-label" className="text-xs font-medium">
                What the customer reads (optional)
              </Label>
              <Input
                id="stage-label"
                value={stageLabel}
                maxLength={200}
                onChange={(event) => setStageLabel(event.target.value)}
                placeholder={defaultStageLabels[pendingStage]}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setPendingStage(null)} disabled={savingStage}>
                  Cancel
                </Button>
                <Button size="sm" onClick={applyStage} disabled={savingStage} className="gap-1.5">
                  {savingStage && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Update to {shipmentStages[stageIndex(pendingStage)].label}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {/* Details */}
        <div className="space-y-3">
          <p className="text-xs font-medium">Shipping details</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="order-dest" className="text-xs text-muted-foreground">
                Destination
              </Label>
              <Input
                id="order-dest"
                value={details.destination}
                onChange={(event) => setDetails({ ...details, destination: event.target.value })}
                placeholder="Mombasa, Kenya"
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="order-vessel" className="text-xs text-muted-foreground">
                Vessel and voyage
              </Label>
              <Input
                id="order-vessel"
                value={details.vessel}
                onChange={(event) => setDetails({ ...details, vessel: event.target.value })}
                placeholder="Morning Cindy V.214"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="order-eta" className="text-xs text-muted-foreground">
                ETA
              </Label>
              <Input
                id="order-eta"
                type="date"
                value={details.etaDate}
                onChange={(event) => setDetails({ ...details, etaDate: event.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="order-price" className="text-xs text-muted-foreground">
                Price paid (USD)
              </Label>
              <Input
                id="order-price"
                inputMode="numeric"
                value={details.price}
                onChange={(event) => setDetails({ ...details, price: event.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <a
                href={`mailto:${order.customerEmail}?subject=${encodeURIComponent(
                  `Your order ${order.id}`
                )}&body=${encodeURIComponent(emailBody)}`}
              >
                <Mail className="h-3.5 w-3.5" />
                Email customer
              </a>
            </Button>
            <Button size="sm" variant="outline" onClick={saveDetails} disabled={savingDetails} className="gap-1.5">
              {savingDetails ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save details
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Timeline */}
        <div>
          <p className="text-xs font-medium mb-3">Timeline the customer sees</p>
          <div className="flex gap-2 mb-4">
            <Input
              value={note}
              maxLength={200}
              onChange={(event) => setNote(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void addNote();
                }
              }}
              placeholder="Add an update, e.g. B/L sent by DHL"
              aria-label="New timeline update"
            />
            <Button variant="outline" onClick={addNote} disabled={savingNote || !note.trim()} className="gap-1.5">
              {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </div>

          {loadingUpdates ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ol className="space-y-3">
              {updates.map((update) => (
                <li key={update.id} className="flex gap-3 group">
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0",
                      update.stage ? "bg-primary" : "bg-muted-foreground"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{update.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(update.at)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeUpdate(update)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive p-1"
                    aria-label={`Remove "${update.label}"`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        {canDelete && (
          <>
            <Separator className="my-6" />
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete order
            </Button>
          </>
        )}

        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`Delete ${order.id}?`}
          description={
            <>
              {order.carLabel} ({formatPrice(order.pricePaidUsd)}) will disappear from{" "}
              {order.customerName || "the customer"}'s dashboard along with its timeline. The car
              itself stays in the inventory — set it back to available there if the sale fell
              through.
            </>
          }
          confirmLabel="Delete order"
          onConfirm={async () => {
            try {
              await deleteOrder(order.id);
              toast.success(`${order.id} deleted`);
              onOpenChange(false);
              onChanged();
            } catch (issue) {
              toast.error(issue instanceof Error ? issue.message : "Couldn't delete that order");
              throw issue;
            }
          }}
        />
      </SheetContent>
    </Sheet>
  );
};

export default AdminOrderSheet;
