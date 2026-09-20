import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Car, formatPrice } from "@/data/cars";
import { RequestKind, sendCarRequest } from "@/lib/carRequests";

const MESSAGE_LIMIT = 2000;

/** Wording per kind: nobody should have to guess what happens next. */
const copy: Record<RequestKind, { title: string; description: string; action: string; placeholder: string }> = {
  buy: {
    title: "Buy it now",
    description:
      "We'll hold this unit for you and reply within one business day with the invoice, total landed cost and payment details. Nothing is charged here.",
    action: "Send purchase request",
    placeholder: "Anything we should know — destination port, shipping line, timing…",
  },
  bid: {
    title: "Place a bid",
    description:
      "Tell us the most you're willing to pay. We bid on your behalf at the auction and never go above your maximum.",
    action: "Place bid",
    placeholder: "Anything we should know before we bid…",
  },
  translation: {
    title: "Request a translation",
    description: "A professional translation of this lot's auction sheet, sent to you by email.",
    action: "Request translation",
    placeholder: "Anything specific you want checked on the sheet?",
  },
  inspection: {
    title: "Request an inspection",
    description: "A detailed inspection report on this vehicle, with photos of anything we find.",
    action: "Request inspection",
    placeholder: "Anything specific you want inspected?",
  },
  inquiry: {
    title: "Ask about this car",
    description: "Your question comes to our team with this vehicle attached. We reply within 24 hours.",
    action: "Send question",
    placeholder: "e.g. Is there rust underneath? Can you send more photos of the interior?",
  },
};

interface CarRequestDialogProps {
  car: Car;
  kind: RequestKind | null;
  userId: string;
  onOpenChange: (open: boolean) => void;
  onSent: () => void;
}

/** Collects one request from a signed-in customer and records it for the team. */
const CarRequestDialog = ({ car, kind, userId, onOpenChange, onSent }: CarRequestDialogProps) => {
  const [message, setMessage] = useState("");
  const [maxBid, setMaxBid] = useState("");
  const [sending, setSending] = useState(false);

  const startingBid = car.auction?.estimateLowUsd ?? 0;

  useEffect(() => {
    if (!kind) return;
    setMessage("");
    setMaxBid(kind === "bid" && startingBid ? String(startingBid) : "");
  }, [kind, startingBid]);

  if (!kind) return null;

  const text = copy[kind];
  const carLabel = `${car.year} ${car.make} ${car.model}${car.grade ? ` ${car.grade}` : ""}`;

  const submit = async () => {
    if (kind === "bid") {
      if (!/^\d+$/.test(maxBid.trim())) {
        toast.error("Enter your maximum bid in whole dollars");
        return;
      }
      if (startingBid && Number(maxBid) < startingBid) {
        toast.error(`Bidding starts at ${formatPrice(startingBid)}`);
        return;
      }
    }
    if (kind === "inquiry" && message.trim().length < 10) {
      toast.error("Tell us a little more so we can answer properly");
      return;
    }

    setSending(true);
    try {
      await sendCarRequest(
        {
          carId: car.id,
          carLabel,
          kind,
          maxBidUsd: kind === "bid" ? Number(maxBid) : undefined,
          message,
        },
        userId
      );
      toast.success(
        kind === "bid" ? "Bid placed" : kind === "buy" ? "Purchase request sent" : "Request sent",
        { description: "Our team will be in touch within one business day." }
      );
      onOpenChange(false);
      onSent();
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Couldn't send that just now");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{text.title}</DialogTitle>
          <DialogDescription>{text.description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-secondary/40 p-3">
          <p className="font-medium text-sm text-foreground">{carLabel}</p>
          <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
            {car.auction ? `Lot ${car.auction.lotNumber}` : car.id}
            {" · "}
            {car.auction ? `from ${formatPrice(startingBid)}` : formatPrice(car.priceUsd)}
          </p>
        </div>

        {kind === "bid" && (
          <div>
            <Label htmlFor="max-bid" className="text-xs font-medium">
              Your maximum bid (USD)
            </Label>
            <Input
              id="max-bid"
              inputMode="numeric"
              value={maxBid}
              onChange={(event) => setMaxBid(event.target.value)}
              className="mt-1.5"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              We bid up to this and stop. Auction fees and shipping are quoted separately.
            </p>
          </div>
        )}

        <div>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="request-message" className="text-xs font-medium">
              {kind === "inquiry" ? "Your question" : "Message (optional)"}
            </Label>
            <span className="text-xs tabular-nums text-muted-foreground">
              {message.length}/{MESSAGE_LIMIT}
            </span>
          </div>
          <Textarea
            id="request-message"
            rows={4}
            maxLength={MESSAGE_LIMIT}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={text.placeholder}
            className="mt-1.5 resize-none"
            autoFocus={kind !== "bid"}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={sending} className="gap-1.5">
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
            {text.action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CarRequestDialog;
