import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFeaturedCars } from "@/data/cars";
import CarCard from "./CarCard";

const NewArrivals = () => {
  const cars = getFeaturedCars(4);

  return (
    <section className="py-12" id="stock">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            New <span className="text-primary">Arrivals</span>
          </h2>
          <p className="text-muted-foreground mt-1">Fresh stock added daily</p>
        </div>
        <Button asChild variant="ghost" className="text-primary hover:text-primary/90 gap-2">
          <Link to="/stock-cars">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cars.map((car, index) => (
          <div key={car.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CarCard car={car} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
