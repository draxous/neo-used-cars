import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import CarGrid from "@/components/CarGrid";
import MakersSidebar from "@/components/MakersSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SortKey,
  collections,
  filterCars,
  getMakeName,
  getModelName,
  getModels,
  sortOptions,
} from "@/data/cars";

type StockVariant = "all" | "make" | "model" | "collection";

const StockCars = ({ variant = "all" }: { variant?: StockVariant }) => {
  const { makeSlug, modelSlug, collectionSlug } = useParams();
  const [sort, setSort] = useState<SortKey>("newest");

  const makeName = makeSlug ? getMakeName(makeSlug) : undefined;
  const modelName =
    makeSlug && modelSlug ? getModelName(makeSlug, modelSlug) : undefined;
  const collection = collections.find((c) => c.slug === collectionSlug);

  const results = useMemo(
    () =>
      filterCars(
        {
          make: variant === "make" || variant === "model" ? makeSlug : undefined,
          model: variant === "model" ? modelSlug : undefined,
          collection: variant === "collection" ? collectionSlug : undefined,
        },
        sort
      ),
    [variant, makeSlug, modelSlug, collectionSlug, sort]
  );

  const siblingModels = makeSlug ? getModels(makeSlug) : [];

  const { title, subtitle } = (() => {
    if (variant === "collection" && collection)
      return { title: collection.name, subtitle: collection.description };
    if (variant === "model" && makeName && modelName)
      return {
        title: `${makeName} ${modelName} for sale`,
        subtitle: `Used ${makeName} ${modelName} stock, inspected in Japan and ready for export worldwide.`,
      };
    if (variant === "make" && makeName)
      return {
        title: `Used ${makeName} for sale`,
        subtitle: `Browse our full range of used ${makeName} vehicles available for direct export from Japan.`,
      };
    return {
      title: "Stock Cars",
      subtitle:
        "Our full inventory of quality Japanese used vehicles, ready to purchase and ship.",
    };
  })();

  return (
    <Layout>
      {/* Breadcrumb + page heading */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground mb-3"
          >
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/stock-cars" className="hover:text-primary transition-colors">
              Stock Cars
            </Link>
            {makeName && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link
                  to={`/stock-cars/${makeSlug}`}
                  className="hover:text-primary transition-colors"
                >
                  {makeName}
                </Link>
              </>
            )}
            {modelName && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">{modelName}</span>
              </>
            )}
            {collection && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">{collection.name}</span>
              </>
            )}
          </nav>

          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">{subtitle}</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <div className="hidden lg:block">
            <MakersSidebar />
          </div>

          <div>
            {/* Model chips when viewing a make */}
            {variant !== "collection" && siblingModels.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {siblingModels.map((model) => (
                  <Link
                    key={model.slug}
                    to={`/stock-cars/${makeSlug}/${model.slug}`}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      model.slug === modelSlug
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {model.name} ({model.count})
                  </Link>
                ))}
              </div>
            )}

            {/* Result count + sort */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{results.length}</span>{" "}
                {results.length === 1 ? "vehicle" : "vehicles"} available
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by</span>
                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <SelectTrigger className="w-[200px] bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CarGrid
              cars={results}
              emptyMessage="We don't have this in stock right now — send us an inquiry and we'll source it from auction."
            />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default StockCars;
