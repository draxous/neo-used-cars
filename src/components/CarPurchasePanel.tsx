import { useCallback, useEffect, useState } from "react";
import { FileSearch, Gavel, Languages, MessageCircle, MessageSquareQuote, ShieldCheck, ShoppingCart } from "lucide-react";
import { siteConfig } from "@/config/site";
import CarRequestDialog from "@/components/CarRequestDialog";
import FavoriteButton from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, formatPrice } from "@/data/cars";
import { CarRequest, RequestKind, listMyCarRequests, requestLabels } from "@/lib/carRequests";
import { formatDate } from "@/lib/userData";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  available: "bg-primary/10 text-primary border-primary/30",
  reserved: "bg-accent/10 text-accent-foreground border-accent/40",
  sold: "bg-muted text-muted-foreground border-border",
};

/** A service we can arrange on an auction lot before it goes under the hammer. */
const services: { kind: RequestKind; title: string; blurb: string; action: string; icon: typeof Languages }[] = [
  {
    kind: "translation",
    title: "Translation Service",
    blurb: "Professional auction sheet translation",
    action: "Request Translation",
    icon: Languages,
  },
  {
    kind: "inspection",
    title: "Inspection Service",
    blurb: "Detailed vehicle inspection report",
    action: "Request Inspection",
    icon: FileSearch,
  },
];

/**
 * What a signed-in customer sees instead of the inquiry form: act on the car
 * directly. Buying and bidding record a request for the team — nothing is
 * charged here — and the panel then shows what has already been asked.
 */
const CarPurchasePanel = ({ car, userId }: { car: Car; userId: string }) => {
  const [asking, setAsking] = useState<RequestKind | null>(null);
  const [mine, setMine] = useState<CarRequest[]>([]);

  const lot = car.auction;
  const status = car.status ?? "available";
  const sold = status === "sold";

  const load = useCallback(() => {
    listMyCarRequests(car.id)
      .then(setMine)
      // Not being able to list past requests shouldn't stop a new one.
      .catch(() => setMine([]));
  }, [car.id]);

  useEffect(load, [load]);

  return (
    <>
      <div className="bg-card rounded-xl card-shadow-hover p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {lot ? "Starting Price" : `FOB Price · ${car.location}`}
            </p>
            <p className="font-display text-3xl font-bold text-primary mt-1">
              {formatPrice(lot ? lot.estimateLowUsd : car.priceUsd)}
            </p>
          </div>
          {!lot && (
            <Badge variant="outline" className={cn("capitalize font-normal", statusTone[status])}>
              {status}
            </Badge>
          )}
        </div>

        {lot ? (
          <p className="text-xs text-muted-foreground mt-1">
            {lot.house} · lot {lot.lotNumber}. You set the maximum; we never bid above it.
          </p>
        ) : (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground">Shipping</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quoted at checkout based on destination port
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-4">
          {lot ? (
            <Button className="gap-1.5" onClick={() => setAsking("bid")}>
              <Gavel className="h-4 w-4" />
              Place Bid
            </Button>
          ) : (
            <Button className="gap-1.5" disabled={sold} onClick={() => setAsking("buy")}>
              <ShoppingCart className="h-4 w-4" />
              Buy It Now
            </Button>
          )}
          <Button variant="outline" className="gap-1.5" onClick={() => setAsking("inquiry")}>
            <MessageSquareQuote className="h-4 w-4" />
            Inquire
          </Button>
        </div>

        {sold && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This one has sold — ask us and we'll find you another.
          </p>
        )}

        <FavoriteButton car={car} variant="inline" label className="w-full mt-2" />

        <Button
          asChild
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold gap-2 mt-2 shadow-sm"
        >
          <a
            href={`https://wa.me/${siteConfig.phoneRaw}?text=${encodeURIComponent(
              `Hello Neo Trading! I am inquiring about the ${car.year} ${car.make} ${car.model} (Stock ID: ${car.id}). Please advise on shipping and availability.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </Button>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border text-sm text-foreground">
          <ShieldCheck className="h-5 w-5 text-accent flex-shrink-0" />
          <span>
            Inspected in Japan
            {car.condition && ` — auction grade ${car.condition}`}
          </span>
        </div>

        {/* What this customer has already asked for on this car */}
        {mine.length > 0 && (
          <ul className="mt-4 pt-4 border-t border-border space-y-1.5">
            {mine.map((request) => (
              <li key={request.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-foreground">
                  {requestLabels[request.kind]}
                  {request.maxBidUsd ? ` · up to ${formatPrice(request.maxBidUsd)}` : ""}
                </span>
                <span className="text-muted-foreground">
                  {request.status === "new" ? "Sent" : request.status} · {formatDate(request.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Auction extras */}
      {lot &&
        services.map((service) => (
          <div key={service.kind} className="bg-card rounded-xl card-shadow-hover p-5">
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
              <service.icon className="h-4 w-4 text-primary" />
              {service.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{service.blurb}</p>
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => setAsking(service.kind)}
            >
              {service.action}
            </Button>
          </div>
        ))}

      <CarRequestDialog
        car={car}
        kind={asking}
        userId={userId}
        onOpenChange={(open) => !open && setAsking(null)}
        onSent={load}
      />
    </>
  );
};

export default CarPurchasePanel;
