import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import CarGrid from "@/components/CarGrid";
import MakersSidebar from "@/components/MakersSidebar";
import SEOHead from "@/components/SEOHead";
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

  const { title, subtitle, seoTitle, seoDescription, canonicalPath } = (() => {
    if (variant === "collection" && collection)
      return {
        title: collection.name,
        subtitle: collection.description,
        seoTitle: `${collection.name} | Auto Imports from Japan - Neo Trading`,
        seoDescription: `Browse ${collection.name} available for direct auto import from Japan. Verified quality, full inspection sheets, and worldwide shipping.`,
        canonicalPath: `/stock-cars/collection/${collection.slug}`,
      };
    if (variant === "model" && makeName && modelName)
      return {
        title: `${makeName} ${modelName} for sale`,
        subtitle: `Used ${makeName} ${modelName} stock, inspected in Japan and ready for export worldwide.`,
        seoTitle: `Used ${makeName} ${modelName} for Sale | Auto Imports from Japan - Neo Trading`,
        seoDescription: `Find quality used ${makeName} ${modelName} vehicles for direct auto import from Japan. Verified Japanese export, inspection reports, and port delivery.`,
        canonicalPath: `/stock-cars/${makeSlug}/${modelSlug}`,
      };
    if (variant === "make" && makeName)
      return {
        title: `Used ${makeName} for sale`,
        subtitle: `Browse our full range of used ${makeName} vehicles available for direct export from Japan.`,
        seoTitle: `Used ${makeName} for Sale | Auto Imports from Japan - Neo Trading`,
        seoDescription: `Browse used ${makeName} cars for sale in Japan. Direct auto imports from Japan, live auction access, and worldwide shipping.`,
        canonicalPath: `/stock-cars/${makeSlug}`,
      };
    return {
      title: "Stock Cars",
      subtitle:
        "Our full inventory of quality Japanese used vehicles, ready to purchase and ship.",
      seoTitle: "Auto Imports from Japan — Verified Used Car Stock | Neo Trading",
      seoDescription:
        "Browse verified Japanese used cars in stock ready for export. Direct auto imports from Japan, pre-shipment inspections, FOB/CIF quotes, and global delivery.",
      canonicalPath: "/stock-cars",
    };
  })();

  const breadcrumbsList = [
    { name: "Home", item: "https://neojapancars.com/" },
    { name: "Stock Cars", item: "https://neojapancars.com/stock-cars" },
    ...(makeName && makeSlug
      ? [{ name: makeName, item: `https://neojapancars.com/stock-cars/${makeSlug}` }]
      : []),
    ...(modelName && makeSlug && modelSlug
      ? [{ name: modelName, item: `https://neojapancars.com/stock-cars/${makeSlug}/${modelSlug}` }]
      : []),
    ...(collection && collectionSlug
      ? [{ name: collection.name, item: `https://neojapancars.com/stock-cars/collection/${collectionSlug}` }]
      : []),
  ];

  const stockSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbsList.map((crumb, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": crumb.name,
          "item": crumb.item,
        })),
      },
      {
        "@type": "ItemList",
        "name": seoTitle,
        "numberOfItems": results.length,
        "itemListElement": results.slice(0, 10).map((car, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": `${car.year} ${car.make} ${car.model}`,
          "url": `https://neojapancars.com/stock-cars/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\\s+/g, "-")}/${car.id}`,
        })),
      },
    ],
  };

  return (
    <Layout>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalPath}
        jsonLd={stockSchema}
      />

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

          <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">{subtitle}</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
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
