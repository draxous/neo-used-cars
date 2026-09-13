import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import FavoriteButton from "./FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarClock, Gauge, Fuel, Gavel, Settings } from "lucide-react";
import {
  Car,
  carPath,
  formatAuctionDate,
  formatEstimate,
  formatMileage,
  formatPrice,
  isNewArrival,
} from "@/data/cars";

const CarCard = ({ car }: { car: Car }) => {
  const lot = car.auction;

  return (
    <Card className="group overflow-hidden bg-card card-shadow hover:card-shadow-hover transition-all duration-300 h-full">
      <Link to={carPath(car)} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
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
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <FavoriteButton car={car} />
            <Badge
              variant="secondary"
              className="bg-card/90 text-foreground font-mono text-[11px]"
            >
              {lot ? `LOT ${lot.lotNumber}` : car.id}
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
            {lot ? (
              <>
                <p className="text-primary-foreground font-display font-bold text-lg">
                  Est. {formatEstimate(lot)}
                </p>
                <p className="text-primary-foreground/70 text-xs">
                  {lot.house} · {formatAuctionDate(lot.date)}
                </p>
              </>
            ) : (
              <>
                <p className="text-primary-foreground font-display font-bold text-xl">
                  {formatPrice(car.priceUsd)}
                </p>
                <p className="text-primary-foreground/70 text-xs">FOB {car.location}</p>
              </>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={carPath(car)}>
          <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {car.make} {car.model}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
          {car.grade ?? car.bodyType}
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{formatMileage(car.mileageKm)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="h-4 w-4 flex-shrink-0" />
            <span>{car.fuel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{car.transmission}</span>
          </div>
        </div>

        {lot ? (
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5 flex-shrink-0" />
              Bidding closes {formatAuctionDate(lot.date)}
            </p>
            <Link
              to={`/inquiry?lot=${car.id}`}
              className="block w-full text-center rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors py-2 text-sm font-medium"
            >
              Bid for me
            </Link>
          </div>
        ) : (
          <Link
            to={carPath(car)}
            className="block w-full text-center rounded-md border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors py-2 text-sm font-medium"
          >
            View Details
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default CarCard;
