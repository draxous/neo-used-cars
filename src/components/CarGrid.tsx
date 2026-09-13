import { Car } from "@/data/cars";
import CarCard from "./CarCard";
import CarListItem from "./CarListItem";

interface CarGridProps {
  cars: Car[];
  emptyMessage?: string;
  /** "list" swaps the cards for wide rows — used by the search page. */
  view?: "grid" | "list";
}

const CarGrid = ({ cars, emptyMessage = "No vehicles match your search.", view = "grid" }: CarGridProps) => {
  if (cars.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-lg card-shadow">
        <p className="font-display text-lg font-semibold text-foreground mb-1">
          Nothing found
        </p>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={
        view === "list"
          ? "flex flex-col gap-4"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      }
    >
      {cars.map((car, index) => (
        <div
          key={car.id}
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
        >
          {view === "list" ? <CarListItem car={car} /> : <CarCard car={car} />}
        </div>
      ))}
    </div>
  );
};

export default CarGrid;
