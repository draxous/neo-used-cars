import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ImagePlus,
  Link2,
  Loader2,
  Save,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car,
  Drive,
  Fuel,
  SaleStatus,
  Steering,
  Transmission,
  carPath,
  collections,
  setInventory,
} from "@/data/cars";
import {
  drives,
  fetchInventory,
  fuels,
  nextStockNumber,
  saleStatuses,
  saveVehicle,
  steerings,
  transmissions,
  uploadVehiclePhoto,
} from "@/lib/inventory";
import { cn } from "@/lib/utils";

/** Numbers are held as text while typing, so a cleared field isn't a 0. */
interface Draft {
  id: string;
  make: string;
  model: string;
  grade: string;
  year: string;
  priceUsd: string;
  mileageKm: string;
  fuel: Fuel;
  transmission: Transmission;
  drive: Drive;
  engineCc: string;
  bodyType: string;
  color: string;
  doors: string;
  seats: string;
  steering: Steering;
  condition: string;
  chassisCode: string;
  location: string;
  images: string[];
  collections: string[];
  featured: boolean;
  arrivedAt: string;
  status: SaleStatus;
  published: boolean;
  isAuction: boolean;
  auctionHouse: string;
  auctionLot: string;
  auctionDate: string;
  auctionLow: string;
  auctionHigh: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const blankDraft = (id: string): Draft => ({
  id,
  make: "",
  model: "",
  grade: "",
  year: String(new Date().getFullYear() - 5),
  priceUsd: "",
  mileageKm: "",
  fuel: "Petrol",
  transmission: "Automatic",
  drive: "2WD",
  engineCc: "",
  bodyType: "",
  color: "",
  doors: "5",
  seats: "5",
  steering: "Right",
  condition: "",
  chassisCode: "",
  location: "Yokohama",
  images: [],
  collections: [],
  featured: false,
  arrivedAt: today(),
  status: "available",
  published: true,
  isAuction: false,
  auctionHouse: "",
  auctionLot: "",
  auctionDate: "",
  auctionLow: "",
  auctionHigh: "",
});

const toDraft = (car: Car): Draft => ({
  id: car.id,
  make: car.make,
  model: car.model,
  grade: car.grade ?? "",
  year: String(car.year),
  priceUsd: String(car.priceUsd),
  mileageKm: String(car.mileageKm),
  fuel: car.fuel,
  transmission: car.transmission,
  drive: car.drive,
  engineCc: String(car.engineCc),
  bodyType: car.bodyType,
  color: car.color,
  doors: String(car.doors),
  seats: String(car.seats),
  steering: car.steering,
  condition: car.condition ?? "",
  chassisCode: car.chassisCode ?? "",
  location: car.location,
  images: car.images,
  collections: car.collections,
  featured: Boolean(car.featured),
  arrivedAt: car.arrivedAt,
  status: car.status ?? "available",
  published: car.published !== false,
  isAuction: Boolean(car.auction),
  auctionHouse: car.auction?.house ?? "",
  auctionLot: car.auction?.lotNumber ?? "",
  auctionDate: car.auction?.date ?? "",
  auctionLow: car.auction ? String(car.auction.estimateLowUsd) : "",
  auctionHigh: car.auction ? String(car.auction.estimateHighUsd) : "",
});

type Errors = Partial<Record<keyof Draft, string>>;

const whole = (value: string) => /^\d+$/.test(value.trim());

/** Checks the draft and, if it's sound, turns it into a Car. */
const validate = (draft: Draft): { errors: Errors; car?: Car } => {
  const errors: Errors = {};
  const need = (key: keyof Draft, label: string) => {
    if (!String(draft[key]).trim()) errors[key] = `${label} is required`;
  };
  const number = (key: keyof Draft, label: string) => {
    if (!String(draft[key]).trim()) errors[key] = `${label} is required`;
    else if (!whole(String(draft[key]))) errors[key] = "Whole numbers only";
  };

  if (!/^[A-Za-z0-9-]{2,40}$/.test(draft.id.trim())) {
    errors.id = "Letters, numbers and dashes only, e.g. NEO-1070";
  }
  need("make", "Make");
  need("model", "Model");
  number("year", "Year");
  number("priceUsd", "Price");
  number("mileageKm", "Mileage");
  number("engineCc", "Engine size");
  number("doors", "Doors");
  number("seats", "Seats");
  need("bodyType", "Body type");
  need("color", "Colour");
  need("location", "Location");
  need("arrivedAt", "Arrival date");

  const year = Number(draft.year);
  if (!errors.year && (year < 1950 || year > new Date().getFullYear() + 1)) {
    errors.year = "That year doesn't look right";
  }

  if (draft.isAuction) {
    need("auctionHouse", "Auction house");
    need("auctionLot", "Lot number");
    need("auctionDate", "Auction date");
    number("auctionLow", "Low estimate");
    number("auctionHigh", "High estimate");
    if (!errors.auctionLow && !errors.auctionHigh && Number(draft.auctionLow) > Number(draft.auctionHigh)) {
      errors.auctionHigh = "Must be at least the low estimate";
    }
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors,
    car: {
      id: draft.id.trim().toUpperCase(),
      make: draft.make.trim(),
      model: draft.model.trim(),
      grade: draft.grade.trim() || undefined,
      year,
      priceUsd: Number(draft.priceUsd),
      mileageKm: Number(draft.mileageKm),
      fuel: draft.fuel,
      transmission: draft.transmission,
      drive: draft.drive,
      engineCc: Number(draft.engineCc),
      bodyType: draft.bodyType.trim(),
      color: draft.color.trim(),
      doors: Number(draft.doors),
      seats: Number(draft.seats),
      steering: draft.steering,
      condition: draft.condition.trim() || undefined,
      chassisCode: draft.chassisCode.trim() || undefined,
      location: draft.location.trim(),
      images: draft.images,
      collections: draft.collections,
      featured: draft.featured,
      arrivedAt: draft.arrivedAt,
      status: draft.status,
      published: draft.published,
      auction: draft.isAuction
        ? {
            house: draft.auctionHouse.trim(),
            lotNumber: draft.auctionLot.trim(),
            date: draft.auctionDate,
            estimateLowUsd: Number(draft.auctionLow),
            estimateHighUsd: Number(draft.auctionHigh),
          }
        : undefined,
    },
  };
};

/** Distinct values already in use, offered as suggestions while typing. */
const distinct = (list: Car[], pick: (car: Car) => string | undefined) =>
  [...new Set(list.map(pick).filter((value): value is string => Boolean(value)))].sort();

const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <section className="bg-card rounded-lg card-shadow p-5">
    <h2 className="font-display font-semibold text-foreground">{title}</h2>
    {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    <div className="mt-4">{children}</div>
  </section>
);

const VehicleEditor = () => {
  const { id: editingId } = useParams();
  const [searchParams] = useSearchParams();
  const copyFrom = searchParams.get("from");
  const navigate = useNavigate();
  const isNew = !editingId;

  const [all, setAll] = useState<Car[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchInventory()
      .then((list) => {
        if (cancelled) return;
        setAll(list);

        if (editingId) {
          const car = list.find((item) => item.id.toLowerCase() === editingId.toLowerCase());
          if (!car) {
            setLoadError(`There's no vehicle with stock number ${editingId}.`);
            return;
          }
          setDraft(toDraft(car));
          return;
        }

        const fresh = nextStockNumber(list);
        const source = copyFrom ? list.find((item) => item.id === copyFrom) : undefined;
        // A duplicate keeps the specs but not the identity or the photos of
        // the original — those belong to one physical car.
        setDraft(
          source
            ? { ...toDraft(source), id: fresh, images: [], chassisCode: "", arrivedAt: today(), status: "available", featured: false }
            : blankDraft(fresh)
        );
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load the inventory. Check the database connection.");
      });
    return () => {
      cancelled = true;
    };
  }, [editingId, copyFrom]);

  const suggestions = useMemo(
    () => ({
      makes: distinct(all, (car) => car.make),
      models: distinct(
        all.filter((car) => car.make.toLowerCase() === draft?.make.trim().toLowerCase()),
        (car) => car.model
      ),
      bodyTypes: distinct(all, (car) => car.bodyType),
      locations: distinct(all, (car) => car.location),
      houses: distinct(all, (car) => car.auction?.house),
    }),
    [all, draft?.make]
  );

  if (loadError) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const field = (
    key: keyof Draft,
    label: string,
    { className, ...props }: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <div>
      <Label htmlFor={`v-${key}`} className="text-xs font-medium">
        {label}
      </Label>
      <Input
        id={`v-${key}`}
        value={String(draft[key])}
        onChange={(event) => set(key, event.target.value as never)}
        aria-invalid={Boolean(errors[key])}
        className={cn("mt-1.5", errors[key] && "border-destructive", className)}
        {...props}
      />
      {errors[key] && <p className="text-xs text-destructive mt-1">{errors[key]}</p>}
    </div>
  );

  const choice = <K extends keyof Draft>(key: K, label: string, options: readonly string[]) => (
    <div>
      <Label className="text-xs font-medium">{label}</Label>
      <Select value={String(draft[key])} onValueChange={(value) => set(key, value as Draft[K])}>
        <SelectTrigger className="mt-1.5" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option} className="capitalize">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const picked = [...files];
    setUploading((count) => count + picked.length);
    // One at a time keeps the order the photos were picked in.
    for (const file of picked) {
      try {
        const url = await uploadVehiclePhoto(draft.id, file);
        setDraft((current) => (current ? { ...current, images: [...current.images, url] } : current));
      } catch (issue) {
        toast.error(`${file.name}: ${issue instanceof Error ? issue.message : "upload failed"}`);
      } finally {
        setUploading((count) => count - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  };

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!/^https:\/\/\S+$/i.test(url)) {
      toast.error("Paste a full https:// link to the photo");
      return;
    }
    set("images", [...draft.images, url]);
    setImageUrl("");
  };

  const moveImage = (from: number, to: number) => {
    const next = [...draft.images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set("images", next);
  };

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const { errors: found, car } = validate(draft);
    setErrors(found);
    if (!car) {
      toast.error("Some fields need attention");
      document.querySelector("[aria-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSaving(true);
    try {
      await saveVehicle(car, isNew);
      // Keep the public pages in step without a reload.
      const next = isNew ? [car, ...all] : all.map((item) => (item.id === car.id ? car : item));
      setInventory(next);
      toast.success(isNew ? `${car.id} added` : `${car.id} saved`);
      navigate("/admin/inventory");
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Couldn't save this vehicle");
    } finally {
      setSaving(false);
    }
  };

  const title = isNew ? (copyFrom ? `Duplicate of ${copyFrom}` : "New vehicle") : `Edit ${draft.id}`;

  return (
    <form onSubmit={onSave} noValidate className="space-y-5 max-w-4xl">
      <BackLink />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isNew
              ? "Everything here appears on the listing page."
              : `${draft.year} ${draft.make} ${draft.model}`}
          </p>
        </div>
        {!isNew && (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <a href={carPath({ id: draft.id, make: draft.make, model: draft.model } as Car)} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              View on site
            </a>
          </Button>
        )}
      </div>

      <datalist id="dl-makes">{suggestions.makes.map((value) => <option key={value} value={value} />)}</datalist>
      <datalist id="dl-models">{suggestions.models.map((value) => <option key={value} value={value} />)}</datalist>
      <datalist id="dl-bodies">{suggestions.bodyTypes.map((value) => <option key={value} value={value} />)}</datalist>
      <datalist id="dl-locations">{suggestions.locations.map((value) => <option key={value} value={value} />)}</datalist>
      <datalist id="dl-houses">{suggestions.houses.map((value) => <option key={value} value={value} />)}</datalist>

      <Section title="Listing" hint="Whether and how this car shows up on the site.">
        <div className="grid sm:grid-cols-3 gap-4">
          {field("id", "Stock number", {
            disabled: !isNew,
            className: "font-mono uppercase",
            title: isNew ? undefined : "The stock number is part of the page address, so it's fixed once saved.",
          })}
          {choice("status", "Sales status", saleStatuses)}
          {field("arrivedAt", "Arrived in stock", { type: "date" })}
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 mt-5">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch checked={draft.published} onCheckedChange={(checked) => set("published", checked)} />
            Show on the website
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch checked={draft.featured} onCheckedChange={(checked) => set("featured", checked)} />
            Feature on the home page
          </label>
        </div>
        <div className="mt-5">
          <p className="text-xs font-medium">Collections</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
            {collections.map((collection) => (
              <label key={collection.slug} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={draft.collections.includes(collection.slug)}
                  onCheckedChange={(checked) =>
                    set(
                      "collections",
                      checked
                        ? [...draft.collections, collection.slug]
                        : draft.collections.filter((slug) => slug !== collection.slug)
                    )
                  }
                />
                {collection.name}
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Vehicle">
        <div className="grid sm:grid-cols-3 gap-4">
          {field("make", "Make", { list: "dl-makes", placeholder: "Toyota" })}
          {field("model", "Model", { list: "dl-models", placeholder: "Land Cruiser Prado" })}
          {field("grade", "Grade / trim (optional)", { placeholder: "TX L Package" })}
          {field("year", "Year", { inputMode: "numeric" })}
          {field("bodyType", "Body type", { list: "dl-bodies", placeholder: "SUV" })}
          {field("color", "Colour", { placeholder: "Pearl White" })}
          {field("priceUsd", "FOB price (USD)", { inputMode: "numeric", placeholder: "28500" })}
          {field("location", "Ships from", { list: "dl-locations" })}
          {field("chassisCode", "Chassis code (optional)", { className: "font-mono" })}
        </div>
      </Section>

      <Section title="Specifications">
        <div className="grid sm:grid-cols-4 gap-4">
          {field("mileageKm", "Mileage (km)", { inputMode: "numeric" })}
          {field("engineCc", "Engine (cc)", { inputMode: "numeric" })}
          {choice("fuel", "Fuel", fuels)}
          {choice("transmission", "Transmission", transmissions)}
          {choice("drive", "Drive", drives)}
          {choice("steering", "Steering", steerings)}
          {field("doors", "Doors", { inputMode: "numeric" })}
          {field("seats", "Seats", { inputMode: "numeric" })}
          {field("condition", "Auction grade (optional)", { placeholder: "4.5/B" })}
        </div>
      </Section>

      <Section title="Photos" hint="The first photo is the cover. Large photos are resized before upload.">
        {draft.images.length > 0 && (
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {draft.images.map((url, index) => (
              <li key={`${url}-${index}`} className="relative group rounded-md overflow-hidden border border-border">
                <img src={url} alt={`Photo ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Cover
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1">
                  <div className="flex gap-0.5">
                    <IconButton label="Move earlier" disabled={index === 0} onClick={() => moveImage(index, index - 1)}>
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      label="Move later"
                      disabled={index === draft.images.length - 1}
                      onClick={() => moveImage(index, index + 1)}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </IconButton>
                    {index > 0 && (
                      <IconButton label="Make cover photo" onClick={() => moveImage(index, 0)}>
                        <Star className="h-3.5 w-3.5" />
                      </IconButton>
                    )}
                  </div>
                  <IconButton
                    label="Remove photo"
                    onClick={() => set("images", draft.images.filter((_, i) => i !== index))}
                  >
                    <X className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(event) => void onFiles(event.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={() => fileInput.current?.click()}
            disabled={uploading > 0}
          >
            {uploading > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading > 0 ? `Uploading ${uploading}…` : "Upload photos"}
          </Button>
          <div className="flex flex-1 min-w-[16rem] gap-2">
            <Input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addImageUrl();
                }
              }}
              placeholder="…or paste a photo link (https://)"
              aria-label="Photo link"
            />
            <Button type="button" variant="ghost" className="gap-1.5" onClick={addImageUrl}>
              <Link2 className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
        {draft.images.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            No photos yet. The car can still be saved; add them before switching it on.
          </p>
        )}
      </Section>

      <Section title="Auction lot" hint="For a lot we'd bid on for a customer, rather than a car we own.">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch checked={draft.isAuction} onCheckedChange={(checked) => set("isAuction", checked)} />
          This is an upcoming auction lot
        </label>
        {draft.isAuction && (
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            {field("auctionHouse", "Auction house", { list: "dl-houses", placeholder: "USS Nagoya" })}
            {field("auctionLot", "Lot number")}
            {field("auctionDate", "Auction date", { type: "date" })}
            {field("auctionLow", "Estimate from (USD)", { inputMode: "numeric" })}
            {field("auctionHigh", "Estimate to (USD)", { inputMode: "numeric" })}
          </div>
        )}
      </Section>

      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-t border-border flex justify-end gap-2">
        <Button asChild variant="ghost">
          <Link to="/admin/inventory">Cancel</Link>
        </Button>
        <Button type="submit" disabled={saving || uploading > 0} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? "Add vehicle" : "Save changes"}
        </Button>
      </div>
    </form>
  );
};

const BackLink = () => (
  <Link to="/admin/inventory" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
    <ArrowLeft className="h-4 w-4" />
    Inventory
  </Link>
);

const IconButton = ({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent"
  >
    {children}
  </button>
);

export default VehicleEditor;
