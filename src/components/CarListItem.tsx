import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import FavoriteButton from "./FavoriteButton";
import {
  Calendar,
  CalendarClock,
  Cog,
  Fuel,
  Gauge,
  Gavel,
  MapPin,
  Palette,
  Settings,
  ShieldCheck,
} from "lucide-react";
import {
  Car,
  carPath,
  formatAuctionDate,
  formatEngine,
  formatEstimate,
  formatMileage,
  formatPrice,
  isNewArrival,
} from "@/data/cars";

/** Row layout used by the search page's list view — same data, more of it visible. */
const CarListItem = ({ car }: { car: Car }) => {
  const lot = car.auction;
  const specs = [
    { icon: Calendar, label: String(car.year) },
    { icon: Gauge, label: formatMileage(car.mileageKm) },
    { icon: Cog, label: `${formatEngine(car.engineCc)} ${car.engineCc.toLocaleString()}cc` },
    { icon: Fuel, label: car.fuel },
    { icon: Settings, label: car.transmission },
    { icon: Palette, label: car.color },
  ];

  return (
    <Card className="group overflow-hidden bg-card card-shadow hover:card-shadow-hover transition-all duration-300">
      <div className="grid sm:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr_200px]">
        <Link to={carPath(car)} className="relative block aspect-[4/3] sm:aspect-auto sm:h-full overflow-hidden">
          <img
            src={car.images[0]}
            alt={`${car.year} ${car.make} ${car.model}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {lot ? (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground gap-1">
              <Gavel className="h-3 w-3" />
              AUCTION
            </Badge>
          ) : (
            isNewArrival(car) && (
              <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">NEW</Badge>
            )
          )}
          <FavoriteButton car={car} className="absolute top-3 right-3" />
        </Link>

        <div className="p-4 lg:p-5 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <Link to={carPath(car)} className="min-w-0">
              <h3 className="font-display font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                {car.year} {car.make} {car.model}
              </h3>
            </Link>
            <span className="font-mono text-[11px] text-muted-foreground flex-shrink-0">
              {lot ? `LOT ${lot.lotNumber}` : car.id}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3 truncate">
            {car.grade ?? car.bodyType} · {car.bodyType} · {car.drive}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {specs.map((spec) => (
              <div key={spec.label} className="flex items-center gap-1.5 min-w-0">
                <spec.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{spec.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {car.condition && (
              <Badge variant="secondary" className="gap-1 font-normal">
                <ShieldCheck className="h-3.5 w-3.5" />
                Grade {car.condition}
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1 font-normal">
              {lot ? <Gavel className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
              {lot ? lot.house : car.location}
            </Badge>
            {lot && (
              <Badge variant="secondary" className="gap-1 font-normal">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatAuctionDate(lot.date)}
              </Badge>
            )}
            <Badge variant="secondary" className="font-normal">
              {car.steering} hand drive
            </Badge>
          </div>
        </div>

        <div className="flex lg:flex-col items-center lg:items-stretch justify-between gap-3 p-4 lg:p-5 border-t lg:border-t-0 lg:border-l border-border">
          <div className="lg:text-right">
            {lot ? (
              <>
                <p className="text-xs text-muted-foreground">Estimate</p>
                <p className="font-display font-bold text-xl text-foreground leading-tight">
                  {formatEstimate(lot)}
                </p>
              </>
            ) : (
              <>
                <p className="font-display font-bold text-2xl text-foreground leading-tight">
                  {formatPrice(car.priceUsd)}
                </p>
                <p className="text-xs text-muted-foreground">FOB {car.location}</p>
              </>
            )}
          </div>
          <div className="flex gap-2 lg:flex-col lg:mt-auto">
            {lot ? (
              <>
                <Link
                  to={`/inquiry?lot=${car.id}`}
                  className="rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors px-4 py-2 text-sm font-medium text-center"
                >
                  Bid for me
                </Link>
                <Link
                  to={carPath(car)}
                  className="rounded-md border border-border text-foreground hover:border-primary hover:text-primary transition-colors px-4 py-2 text-sm font-medium text-center"
                >
                  Lot details
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={carPath(car)}
                  className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 text-sm font-medium text-center"
                >
                  View Details
                </Link>
                <Link
                  to={`/inquiry?stock=${car.id}`}
                  className="rounded-md border border-border text-foreground hover:border-primary hover:text-primary transition-colors px-4 py-2 text-sm font-medium text-center"
                >
                  Inquire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CarListItem;
