import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  Fuel,
  Gauge,
  MapPin,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Layout from "@/components/Layout";
import CarGrid from "@/components/CarGrid";
import InquiryForm from "@/components/InquiryForm";
import FavoriteButton from "@/components/FavoriteButton";
import NotFound from "./NotFound";
import { Badge } from "@/components/ui/badge";
import {
  carPath,
  formatAuctionDate,
  formatEstimate,
  formatMileage,
  formatPrice,
  getCarById,
  getRelatedCars,
  isNewArrival,
  slugify,
} from "@/data/cars";

const CarDetail = () => {
  const { id } = useParams();
  const car = id ? getCarById(id) : undefined;
  const [activeImage, setActiveImage] = useState(0);

  if (!car) return <NotFound />;

  const related = getRelatedCars(car);
  const lot = car.auction;

  const specs: { label: string; value: string }[] = [
    { label: lot ? "Lot No." : "Stock No.", value: lot ? lot.lotNumber : car.id },
    { label: "Year", value: String(car.year) },
    { label: "Mileage", value: formatMileage(car.mileageKm) },
    { label: "Engine", value: `${car.engineCc.toLocaleString()} cc` },
    { label: "Fuel", value: car.fuel },
    { label: "Transmission", value: car.transmission },
    { label: "Drive", value: car.drive },
    { label: "Body type", value: car.bodyType },
    { label: "Colour", value: car.color },
    { label: "Doors", value: String(car.doors) },
    { label: "Seats", value: String(car.seats) },
    { label: "Steering", value: car.steering },
    ...(car.chassisCode ? [{ label: "Chassis", value: car.chassisCode }] : []),
    ...(car.condition ? [{ label: "Grade", value: car.condition }] : []),
  ];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground"
          >
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/stock-cars" className="hover:text-primary transition-colors">
              Stock Cars
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              to={`/stock-cars/${slugify(car.make)}`}
              className="hover:text-primary transition-colors"
            >
              {car.make}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              to={`/stock-cars/${slugify(car.make)}/${slugify(car.model)}`}
              className="hover:text-primary transition-colors"
            >
              {car.model}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-mono">{car.id}</span>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div>
            {/* Gallery */}
            <div className="bg-card rounded-xl card-shadow overflow-hidden mb-6">
              <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-secondary">
                <img
                  src={car.images[activeImage]}
                  alt={`${car.year} ${car.make} ${car.model} — photo ${activeImage + 1}`}
                  className="w-full h-full object-cover"
                />
                {isNewArrival(car) && (
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                    NEW ARRIVAL
                  </Badge>
                )}
              </div>
              {car.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {car.images.map((image, index) => (
                    <button
                      key={image + index}
                      onClick={() => setActiveImage(index)}
                      aria-label={`View photo ${index + 1}`}
                      className={`h-20 w-28 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                        index === activeImage ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + headline stats */}
            <div className="mb-6">
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                {car.year} {car.make} {car.model}
              </h1>
              {car.grade && <p className="text-muted-foreground mt-1">{car.grade}</p>}

              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {car.year}
                </span>
                <span className="flex items-center gap-1.5">
                  <Gauge className="h-4 w-4" /> {formatMileage(car.mileageKm)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Fuel className="h-4 w-4" /> {car.fuel}
                </span>
                <span className="flex items-center gap-1.5">
                  <Settings className="h-4 w-4" /> {car.transmission}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {car.location}
                </span>
              </div>
            </div>

            {/* Spec table */}
            <div className="bg-card rounded-xl card-shadow p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Vehicle <span className="text-primary">Specification</span>
              </h2>
              <dl className="grid sm:grid-cols-2 gap-x-8">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex justify-between gap-4 py-2.5 border-b border-border text-sm"
                  >
                    <dt className="text-muted-foreground">{spec.label}</dt>
                    <dd className="text-foreground font-medium text-right">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Sticky price + inquiry panel */}
          <aside className="lg:sticky lg:top-28 space-y-4">
            <div className="bg-card rounded-xl card-shadow-hover p-5">
              {lot ? (
                <>
                  <p className="text-sm text-muted-foreground">Auction estimate</p>
                  <p className="font-display text-3xl font-bold text-primary mt-1">
                    {formatEstimate(lot)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lot.house} · lot {lot.lotNumber} · {formatAuctionDate(lot.date)}. You set the
                    maximum; we never bid above it.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">FOB {car.location}</p>
                  <p className="font-display text-4xl font-bold text-primary mt-1">
                    {formatPrice(car.priceUsd)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shipping and insurance quoted separately for your port.
                  </p>
                </>
              )}

              <FavoriteButton car={car} variant="inline" label className="w-full mt-4" />

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border text-sm text-foreground">
                <ShieldCheck className="h-5 w-5 text-accent flex-shrink-0" />
                <span>
                  Inspected in Japan
                  {car.condition && ` — auction grade ${car.condition}`}
                </span>
              </div>
            </div>

            <div className="bg-card rounded-xl card-shadow-hover p-5">
              <h2 className="font-display font-bold text-xl text-foreground mb-1">
                {lot ? "Bid on this lot" : "Inquire about this car"}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {lot ? "Lot" : "Stock"}{" "}
                <span className="font-mono">{lot ? lot.lotNumber : car.id}</span> — we reply within
                24 hours.
              </p>
              <InquiryForm variant="compact" defaultMake={car.make} defaultModel={car.model} />
            </div>
          </aside>
        </div>

        {/* Related stock */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              More from <span className="text-primary">{car.make}</span>
            </h2>
            <CarGrid cars={related} />
          </section>
        )}
      </main>
    </Layout>
  );
};

export default CarDetail;
