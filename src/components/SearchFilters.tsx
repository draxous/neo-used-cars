import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMakes, getModels, getYearRange, priceBands } from "@/data/cars";

const ANY = "any";

const SearchFilters = () => {
  const navigate = useNavigate();
  const makes = useMemo(() => getMakes("stock", { all: true }), []);
  const years = useMemo(getYearRange, []);

  const [make, setMake] = useState(ANY);
  const [model, setModel] = useState(ANY);
  const [yearFrom, setYearFrom] = useState(ANY);
  const [yearTo, setYearTo] = useState(ANY);
  const [price, setPrice] = useState(ANY);
  const [keyword, setKeyword] = useState("");

  // Models depend on the selected make, so reset the model when make changes.
  const models = make === ANY ? [] : getModels(make);

  const handleMakeChange = (value: string) => {
    setMake(value);
    setModel(ANY);
  };

  // Everything here is just a shortcut into /search — the search page owns the
  // full filter set, so the param names must match its codec exactly.
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (make !== ANY) params.set("make", make);
    if (model !== ANY) params.set("model", model);
    if (yearFrom !== ANY) params.set("yearFrom", yearFrom);
    if (yearTo !== ANY) params.set("yearTo", yearTo);
    const band = priceBands.find((entry) => entry.value === price);
    if (band) {
      if (band.min) params.set("priceMin", String(band.min));
      if (band.max !== undefined) params.set("priceMax", String(band.max));
    }
    if (keyword.trim()) params.set("q", keyword.trim());
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="py-8 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Select value={make} onValueChange={handleMakeChange}>
            <SelectTrigger aria-label="Make">
              <SelectValue placeholder="Select Make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All Makes</SelectItem>
              {makes.map((item) => (
                <SelectItem key={item.slug} value={item.slug}>
                  {item.name}
                  {item.count > 0 && ` (${item.count})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={model} onValueChange={setModel} disabled={make === ANY}>
            <SelectTrigger aria-label="Model">
              <SelectValue placeholder={make === ANY ? "Select Make first" : "Select Model"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All Models</SelectItem>
              {models.map((item) => (
                <SelectItem key={item.slug} value={item.slug}>
                  {item.name} ({item.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearFrom} onValueChange={setYearFrom}>
            <SelectTrigger aria-label="Year from">
              <SelectValue placeholder="Year From" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value={ANY}>Any</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearTo} onValueChange={setYearTo}>
            <SelectTrigger aria-label="Year to">
              <SelectValue placeholder="Year To" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value={ANY}>Any</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={price} onValueChange={setPrice}>
            <SelectTrigger aria-label="Price range">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any Price</SelectItem>
              {priceBands.map((band) => (
                <SelectItem key={band.value} value={band.value}>
                  {band.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleSearch}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by Stock ID or Keywords..."
            className="max-w-md"
          />
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Advanced search
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;
