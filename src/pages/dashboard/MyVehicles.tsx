import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Car as CarIcon,
  ChevronRight,
  MapPin,
  MessageSquareQuote,
  Search,
  Ship,
} from "lucide-react";
import OrderMessageSheet from "@/components/OrderMessageSheet";
import ShipmentTracker from "@/components/ShipmentTracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { carPath, formatMileage, formatPrice, getCarById } from "@/data/cars";
import { formatDate, Purchase, shipmentStages, stageIndex, useUserData } from "@/lib/userData";

/** Days until an ETA, phrased for a customer who's waiting. */
const etaLabel = (iso?: string): string | null => {
  if (!iso) return null;
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "Arrived";
  if (days === 0) return "Arriving today";
  if (days === 1) return "Arriving tomorrow";
  return `${days} days away`;
};

const MyVehicles = () => {
  const { purchases } = useUserData();
  // Which order the message panel is open for, and the label to show in it.
  const [asking, setAsking] = useState<{ purchase: Purchase; carLabel?: string } | null>(null);

  const sorted = [...purchases].sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          My <span className="text-primary">vehicles</span>
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Everything you've bought from us, from payment through to arrival at your port.
        </p>
      </div>

      {sorted.length > 0 ? (
        <div className="space-y-4">
          {sorted.map((purchase) => {
            const car = getCarById(purchase.carId);
            const carLabel = car ? `${car.year} ${car.make} ${car.model}` : undefined;
            const eta = etaLabel(purchase.etaDate);
            const stageLabel = shipmentStages[stageIndex(purchase.stage)]?.label;

            return (
              <article key={purchase.id} className="bg-card rounded-lg card-shadow overflow-hidden">
                <div className="grid sm:grid-cols-[220px_1fr]">
                  {car && (
                    <Link to={carPath(car)} className="block h-40 sm:h-full">
                      <img
                        src={car.images[0]}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                  )}

                  <div className="p-5 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-display font-semibold text-lg text-foreground truncate">
                          {car ? `${car.year} ${car.make} ${car.model}` : purchase.carId}
                        </h2>
                        <p className="text-sm text-muted-foreground truncate">
                          {car ? `${car.grade ?? car.bodyType} · ${formatMileage(car.mileageKm)}` : ""}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display font-bold text-lg text-foreground leading-tight">
                          {formatPrice(purchase.pricePaidUsd)}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">{purchase.id}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3 mb-5">
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <Ship className="h-3 w-3" />
                        {stageLabel}
                      </Badge>
                      {purchase.destination && (
                        <Badge variant="secondary" className="gap-1 font-normal">
                          <MapPin className="h-3.5 w-3.5" />
                          {purchase.destination}
                        </Badge>
                      )}
                      {purchase.vessel && (
                        <Badge variant="secondary" className="font-normal">
                          {purchase.vessel}
                        </Badge>
                      )}
                      {purchase.etaDate && (
                        <Badge variant="secondary" className="font-normal">
                          ETA {formatDate(purchase.etaDate)}
                          {eta && ` · ${eta}`}
                        </Badge>
                      )}
                    </div>

                    <ShipmentTracker stage={purchase.stage} />

                    <Accordion type="single" collapsible className="mt-4">
                      <AccordionItem value="updates" className="border-t border-border border-b-0">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                          Shipment updates ({purchase.updates.length})
                        </AccordionTrigger>
                        <AccordionContent>
                          <ol className="space-y-3 pt-1">
                            {purchase.updates.map((update) => (
                              <li key={`${update.at}-${update.label}`} className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-foreground">{update.label}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(update.at)}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {car && (
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                          <Link to={carPath(car)}>
                            Vehicle details
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setAsking({ purchase, carLabel })}
                      >
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        Ask about this order
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-lg card-shadow py-16 text-center">
          <CarIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">No vehicles yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-sm mx-auto">
            Once you buy a unit from us it appears here, with inspection, booking and shipping
            updates through to arrival at your port.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
            <Link to="/search">
              <Search className="h-4 w-4" />
              Find your vehicle
            </Link>
          </Button>
        </div>
      )}

      <OrderMessageSheet
        purchase={asking?.purchase ?? null}
        carLabel={asking?.carLabel}
        open={Boolean(asking)}
        onOpenChange={(open) => !open && setAsking(null)}
      />
    </div>
  );
};

export default MyVehicles;
