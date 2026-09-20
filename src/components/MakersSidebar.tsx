import { Link } from "react-router-dom";
import { Car as CarIcon, Layers } from "lucide-react";
import { collections, getMakes } from "@/data/cars";
import { cn } from "@/lib/utils";

interface MakersSidebarProps {
  /**
   * Show only this many makes, the ones with the most stock. Without it the
   * full list is shown — every make we know, whether we hold one or not.
   */
  limit?: number;
  /**
   * Where a make leads. "search" runs a search filtered to it, which is what
   * picking the make from the search box does; "stock" opens its stock page.
   */
  linkTo?: "stock" | "search";
}

const MakersSidebar = ({ limit, linkTo = "stock" }: MakersSidebarProps) => {
  const makes = limit
    ? // Pick the biggest, then list them alphabetically like the make dropdown.
      [...getMakes()]
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .slice(0, limit)
        .sort((a, b) => a.name.localeCompare(b.name))
    : // What we hold first, so a buyer doesn't scroll past empty makes to find it.
      getMakes("stock", { all: true }).sort(
        (a, b) => Number(b.count > 0) - Number(a.count > 0)
      );

  const href = (slug: string) =>
    linkTo === "search" ? `/search?make=${slug}` : `/stock-cars/${slug}`;

  return (
    <aside className="space-y-6">
      {/* Every make we know; ones in stock carry a count */}
      <div className="bg-card rounded-lg card-shadow p-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-card" />
          </div>
          <h3 className="font-display font-semibold text-foreground">
            Browse by <span className="text-primary">Make</span>
          </h3>
        </div>
        {/* The full list is long: scroll it rather than the page. */}
        <ul className={cn("space-y-1", !limit && "max-h-[28rem] overflow-y-auto pr-1 -mr-1")}>
          {makes.map((make) => (
            <li key={make.slug}>
              <Link
                to={href(make.slug)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-secondary rounded-md transition-all"
              >
                <CarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className={cn("flex-1", make.count === 0 && "text-muted-foreground")}>
                  {make.name}
                </span>
                {make.count > 0 && <span className="text-xs text-muted-foreground">{make.count}</span>}
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
