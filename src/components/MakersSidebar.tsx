import { Link } from "react-router-dom";
import { Car as CarIcon, Layers } from "lucide-react";
import { collections, getMakes } from "@/data/cars";

const MakersSidebar = () => {
  const makes = getMakes();

  return (
    <aside className="space-y-6">
      {/* Makes actually present in stock */}
      <div className="bg-card rounded-lg card-shadow p-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-card" />
          </div>
          <h3 className="font-display font-semibold text-foreground">
            Browse by <span className="text-primary">Make</span>
          </h3>
        </div>
        <ul className="space-y-1">
          {makes.map((make) => (
            <li key={make.slug}>
              <Link
                to={`/stock-cars/${make.slug}`}
                className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-secondary rounded-md transition-all"
              >
                <CarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="flex-1">{make.name}</span>
                <span className="text-xs text-muted-foreground">{make.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Curated collections */}
      <div className="bg-card rounded-lg card-shadow p-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Layers className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <h3 className="font-display font-semibold text-foreground">
            Our <span className="text-primary">Collections</span>
          </h3>
        </div>
        <ul className="space-y-1">
          {collections.map((collection) => (
            <li key={collection.slug}>
              <Link
                to={`/stock-cars/collection/${collection.slug}`}
                className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-secondary rounded-md transition-all"
              >
                <CarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {collection.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default MakersSidebar;
