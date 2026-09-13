import { Link } from "react-router-dom";
import {
  ArrowRight,
  Car as CarIcon,
  Gavel,
  Heart,
  MessageSquareQuote,
  Search,
  Ship,
} from "lucide-react";
import CarGrid from "@/components/CarGrid";
import ActivityItem from "@/components/ActivityItem";
import ShipmentTracker from "@/components/ShipmentTracker";
import { Button } from "@/components/ui/button";
import { filterCars, getCarById } from "@/data/cars";
import { useAuth } from "@/lib/auth";
import { formatDate, stageIndex, useUserData } from "@/lib/userData";

const Home = () => {
  const { user } = useAuth();
  const { favorites, activity, purchases } = useUserData();
  if (!user) return null;

  const firstName = user.name.split(" ")[0];
  const inTransit = purchases.filter((purchase) => stageIndex(purchase.stage) < 4);
  const nextArrival = [...inTransit]
    .filter((purchase) => purchase.etaDate)
    .sort((a, b) => (a.etaDate ?? "").localeCompare(b.etaDate ?? ""))[0];
  const nextCar = nextArrival ? getCarById(nextArrival.carId) : undefined;

  const stats = [
    {
      label: "Saved vehicles",
      value: favorites.length,
      icon: Heart,
      href: "/dashboard/favorites",
    },
    {
      label: "In transit",
      value: inTransit.length,
      icon: Ship,
      href: "/dashboard/vehicles",
    },
    {
      label: "My vehicles",
      value: purchases.length,
      icon: CarIcon,
      href: "/dashboard/vehicles",
    },
    {
      label: "Recent updates",
      value: activity.filter(
        (event) => Date.now() - new Date(event.at).getTime() < 7 * 86_400_000
      ).length,
      icon: MessageSquareQuote,
      href: "/dashboard/activity",
    },
  ];

  const recommended = filterCars({}, "newest").slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Welcome back, <span className="text-primary">{firstName}</span>
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Shipping to {user.country} · member since {formatDate(user.createdAt)}
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="group bg-card rounded-lg card-shadow hover:card-shadow-hover transition-all p-4"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground mt-2 leading-none">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Next arrival */}
      {nextArrival && nextCar && (
        <section className="bg-card rounded-lg card-shadow overflow-hidden">
          <div className="grid sm:grid-cols-[200px_1fr]">
            <img
              src={nextCar.images[0]}
              alt={`${nextCar.year} ${nextCar.make} ${nextCar.model}`}
              className="h-40 sm:h-full w-full object-cover"
            />
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Next arrival
                  </p>
                  <h2 className="font-display font-semibold text-lg text-foreground">
                    {nextCar.year} {nextCar.make} {nextCar.model}
                  </h2>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {nextArrival.id}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {nextArrival.vessel ? `${nextArrival.vessel} · ` : ""}
                ETA {formatDate(nextArrival.etaDate!)} at {nextArrival.destination}
              </p>
              <ShipmentTracker stage={nextArrival.stage} compact />
              <Button asChild variant="outline" size="sm" className="mt-4 gap-1.5">
                <Link to="/dashboard/vehicles">
                  Track shipment
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Recommended stock */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg text-foreground">
                Fresh <span className="text-primary">arrivals</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Newest units in stock, ready to ship to {user.country}.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/search">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <CarGrid cars={recommended} />
        </section>

        {/* Recent activity + quick actions */}
        <div className="space-y-6">
          <section className="bg-card rounded-lg card-shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-foreground">Recent activity</h2>
              <Link
                to="/dashboard/activity"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            {activity.length > 0 ? (
              <ul className="space-y-1">
                {activity.slice(0, 4).map((event) => (
                  <ActivityItem key={event.id} event={event} compact />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nothing yet — your saves, inquiries and shipping updates land here.
              </p>
            )}
          </section>

          <section className="bg-card rounded-lg card-shadow p-5">
            <h2 className="font-display font-semibold text-foreground mb-3">Quick actions</h2>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/search">
                  <Search className="h-4 w-4" />
                  Search stock
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/search?type=auction">
                  <Gavel className="h-4 w-4" />
                  Browse auction lots
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/inquiry">
                  <MessageSquareQuote className="h-4 w-4" />
                  Send an inquiry
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
