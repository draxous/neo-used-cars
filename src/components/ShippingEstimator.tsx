import { useState, useMemo } from "react";
import {
  Anchor,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Ship,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteConfig } from "@/config/site";
import { Car, formatPrice } from "@/data/cars";
import { toast } from "sonner";

export interface DestinationPort {
  id: string;
  country: string;
  countryCode: "US" | "UK" | "CA" | "AU" | "NZ" | "KE" | "ZA" | "IE" | "CY" | "JM" | "OTHER";
  portName: string;
  region: string;
  oceanFreightUsd: number;
  insuranceUsd: number;
  inspectionUsd: number;
  inspectionName?: string;
  transitDays: string;
  shippingType: "RoRo" | "Container / RoRo";
  notes?: string;
}

const destinationPorts: DestinationPort[] = [
  // United States
  {
    id: "us-tacoma",
    country: "United States",
    countryCode: "US",
    portName: "Tacoma / Seattle",
    region: "US Pacific Northwest",
    oceanFreightUsd: 1450,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "12–16 days",
    shippingType: "RoRo",
    notes: "Direct Pacific route from Yokohama/Nagoya",
  },
  {
    id: "us-la",
    country: "United States",
    countryCode: "US",
    portName: "Los Angeles / Long Beach",
    region: "US West Coast",
    oceanFreightUsd: 1550,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "14–18 days",
    shippingType: "RoRo",
    notes: "Most popular US West Coast destination",
  },
  {
    id: "us-houston",
    country: "United States",
    countryCode: "US",
    portName: "Galveston / Houston",
    region: "US Gulf Coast",
    oceanFreightUsd: 2100,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "26–32 days",
    shippingType: "RoRo",
    notes: "Via Panama Canal transit",
  },
  {
    id: "us-baltimore",
    country: "United States",
    countryCode: "US",
    portName: "Baltimore / Jacksonville",
    region: "US East Coast",
    oceanFreightUsd: 2250,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "28–35 days",
    shippingType: "RoRo",
    notes: "Major US East Coast auto import hub",
  },

  // United Kingdom
  {
    id: "uk-southampton",
    country: "United Kingdom",
    countryCode: "UK",
    portName: "Southampton",
    region: "South England",
    oceanFreightUsd: 1650,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "35–42 days",
    shippingType: "RoRo",
    notes: "Primary UK vehicle import terminal",
  },
  {
    id: "uk-bristol",
    country: "United Kingdom",
    countryCode: "UK",
    portName: "Bristol (Royal Portbury)",
    region: "South West / Midlands",
    oceanFreightUsd: 1700,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "36–44 days",
    shippingType: "RoRo",
    notes: "Direct rail/road links across England & Wales",
  },
  {
    id: "uk-newcastle",
    country: "United Kingdom",
    countryCode: "UK",
    portName: "Newcastle / Tyne",
    region: "North England / Scotland",
    oceanFreightUsd: 1800,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "38–46 days",
    shippingType: "RoRo",
    notes: "Ideal for Scotland & Northern UK buyers",
  },

  // Canada
  {
    id: "ca-vancouver",
    country: "Canada",
    countryCode: "CA",
    portName: "Vancouver / New Westminster",
    region: "British Columbia",
    oceanFreightUsd: 1450,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "14–18 days",
    shippingType: "RoRo",
    notes: "Shortest transit route from Japan",
  },
  {
    id: "ca-halifax",
    country: "Canada",
    countryCode: "CA",
    portName: "Halifax",
    region: "East Coast / Atlantic",
    oceanFreightUsd: 2150,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "30–38 days",
    shippingType: "RoRo",
    notes: "Serving Eastern Canada & Quebec",
  },

  // Australia
  {
    id: "au-brisbane",
    country: "Australia",
    countryCode: "AU",
    portName: "Brisbane",
    region: "Queensland",
    oceanFreightUsd: 1650,
    insuranceUsd: 150,
    inspectionUsd: 250,
    inspectionName: "DAFF Biosecurity Pre-Clean",
    transitDays: "18–24 days",
    shippingType: "RoRo",
    notes: "Includes Japan quarantine biosecurity wash",
  },
  {
    id: "au-sydney",
    country: "Australia",
    countryCode: "AU",
    portName: "Sydney (Port Kembla)",
    region: "New South Wales",
    oceanFreightUsd: 1700,
    insuranceUsd: 150,
    inspectionUsd: 250,
    inspectionName: "DAFF Biosecurity Pre-Clean",
    transitDays: "20–26 days",
    shippingType: "RoRo",
    notes: "Dedicated auto facility in Port Kembla",
  },
  {
    id: "au-melbourne",
    country: "Australia",
    countryCode: "AU",
    portName: "Melbourne",
    region: "Victoria",
    oceanFreightUsd: 1750,
    insuranceUsd: 150,
    inspectionUsd: 250,
    inspectionName: "DAFF Biosecurity Pre-Clean",
    transitDays: "22–28 days",
    shippingType: "RoRo",
    notes: "High frequency sailings from Yokohama",
  },
  {
    id: "au-perth",
    country: "Australia",
    countryCode: "AU",
    portName: "Fremantle (Perth)",
    region: "Western Australia",
    oceanFreightUsd: 1800,
    insuranceUsd: 150,
    inspectionUsd: 250,
    inspectionName: "DAFF Biosecurity Pre-Clean",
    transitDays: "20–25 days",
    shippingType: "RoRo",
    notes: "Direct southern shipping lane",
  },

  // New Zealand
  {
    id: "nz-auckland",
    country: "New Zealand",
    countryCode: "NZ",
    portName: "Auckland",
    region: "North Island",
    oceanFreightUsd: 1550,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "18–25 days",
    shippingType: "RoRo",
    notes: "NZ border check & radiation clearance arranged",
  },
  {
    id: "nz-christchurch",
    country: "New Zealand",
    countryCode: "NZ",
    portName: "Lyttelton (Christchurch)",
    region: "South Island",
    oceanFreightUsd: 1650,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "20–28 days",
    shippingType: "RoRo",
    notes: "Direct South Island delivery",
  },

  // Kenya & East Africa
  {
    id: "ke-mombasa",
    country: "Kenya",
    countryCode: "KE",
    portName: "Mombasa",
    region: "East Africa Hub",
    oceanFreightUsd: 1850,
    insuranceUsd: 150,
    inspectionUsd: 250,
    inspectionName: "QISJ / JEVIC Roadworthiness",
    transitDays: "28–35 days",
    shippingType: "RoRo",
    notes: "Mandatory QISJ inspection certificate included",
  },

  // South Africa & SADC
  {
    id: "za-durban",
    country: "South Africa",
    countryCode: "ZA",
    portName: "Durban (Transit SADC)",
    region: "Southern Africa",
    oceanFreightUsd: 1850,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "30–38 days",
    shippingType: "RoRo",
    notes: "Bonded transit to Zimbabwe, Zambia, Botswana",
  },

  // Europe & Ireland
  {
    id: "ie-dublin",
    country: "Ireland",
    countryCode: "IE",
    portName: "Dublin",
    region: "Republic of Ireland",
    oceanFreightUsd: 1750,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "38–45 days",
    shippingType: "RoRo",
    notes: "RHD EU market with VRT import scheme",
  },
  {
    id: "cy-limassol",
    country: "Cyprus",
    countryCode: "CY",
    portName: "Limassol",
    region: "Eastern Mediterranean",
    oceanFreightUsd: 1700,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "30–38 days",
    shippingType: "RoRo",
    notes: "Major right-hand drive European destination",
  },

  // Caribbean
  {
    id: "jm-kingston",
    country: "Jamaica",
    countryCode: "JM",
    portName: "Kingston",
    region: "Caribbean",
    oceanFreightUsd: 1950,
    insuranceUsd: 150,
    inspectionUsd: 0,
    transitDays: "35–42 days",
    shippingType: "RoRo",
    notes: "Regular car carriers via Panama Canal",
  },
];

interface ShippingEstimatorProps {
  car: Car;
}

function evaluateCompliance(countryCode: string, carYear: number): {
  status: "eligible" | "warning" | "ineligible" | "info";
  badge: string;
  headline: string;
  detail: string;
} {
  const currentYear = new Date().getFullYear();
  const age = currentYear - carYear;

  if (countryCode === "US") {
    if (age >= 25) {
      return {
        status: "eligible",
        badge: "✅ 25-Year Rule Legal",
        headline: `100% US Street Legal (${age} Years Old)`,
        detail: `Manufactured in ${carYear}. Fully exempt from NHTSA Federal Motor Vehicle Safety Standards (FMVSS) and EPA emissions rules under 49 U.S.C. 30112(b)(9). Eligible for immediate customs clearance with DOT HS-7 and EPA 3520-1.`,
      };
    } else {
      const legalYear = carYear + 25;
      return {
        status: "warning",
        badge: "⚠️ Under 25 Years Old",
        headline: `Legal for US Road Use in ${legalYear}`,
        detail: `Currently ${age} years old. Under US federal law, passenger vehicles must reach 25 years from month of manufacture for full exemption. You can purchase now and store in our bonded Tokyo facility or import under track/display terms.`,
      };
    }
  }

  if (countryCode === "UK") {
    if (age >= 10) {
      return {
        status: "eligible",
        badge: "✅ UK IVA Exempt",
        headline: `IVA Exempt (Over 10 Years Old)`,
        detail: `Manufactured in ${carYear} (${age} yrs old). Exempt from the Individual Vehicle Approval (IVA) test. Requires only a standard UK MOT test, speedometer conversion to MPH, rear fog lamp installation, and DVLA V55/5 registration.`,
      };
    } else {
      return {
        status: "info",
        badge: "ℹ️ Requires UK IVA Test",
        headline: `Subject to UK IVA Test (< 10 Years)`,
        detail: `Vehicles under 10 years old must pass an Individual Vehicle Approval (IVA) test at an approved DVSA facility before first UK road registration.`,
      };
    }
  }

  if (countryCode === "CA") {
    if (age >= 15) {
      return {
        status: "eligible",
        badge: "✅ Canada 15-Yr Legal",
        headline: `100% Canada Street Legal (${age} Years Old)`,
        detail: `Manufactured in ${carYear}. Fully exempt from Transport Canada CMVSS safety regulations under the 15-year rule. Eligible for immediate customs clearance and provincial safety inspection.`,
      };
    } else {
      return {
        status: "ineligible",
        badge: "⛔ Under 15 Years Old",
        headline: `Not Legal for Canada Road Use Until ${carYear + 15}`,
        detail: `Transport Canada strictly prohibits importing non-compliant vehicles younger than 15 years old for road registration.`,
      };
    }
  }

  if (countryCode === "AU") {
    return {
      status: "eligible",
      badge: "✅ Australia Import Eligible",
      headline: `SEVS & 25-Year ROVER Eligible`,
      detail: `Eligible for import under the 25-Year Rolling Concession or Specialist & Enthusiast Vehicle Scheme (SEVS). Mandatory biosecurity pre-cleaning in Japan is included in this estimate.`,
    };
  }

  if (countryCode === "NZ") {
    return {
      status: "eligible",
      badge: "✅ NZTA Import Ready",
      headline: `New Zealand Border Compliant`,
      detail: `Complies with NZTA vehicle inspection standards. Japanese de-registration export certificate and radiation inspection arranged prior to departure.`,
    };
  }

  if (countryCode === "KE") {
    if (age <= 8) {
      return {
        status: "eligible",
        badge: "✅ Kenya 8-Yr Compliant",
        headline: `Meets Kenya Age Restriction (${age} Years Old)`,
        detail: `Under Kenya Bureau of Standards (KEBS) 8-year age limit. Mandatory QISJ roadworthiness pre-export inspection in Japan is included in this CIF calculation.`,
      };
    } else {
      return {
        status: "ineligible",
        badge: "⛔ Exceeds Kenya 8-Yr Limit",
        headline: `Over 8 Years Old (Kenya Road Restriction)`,
        detail: `Vehicles older than 8 years cannot be registered for street use in Kenya. Can be transshipped via Mombasa in bond to Uganda or South Sudan.`,
      };
    }
  }

  return {
    status: "info",
    badge: "Direct Export Ready",
    headline: "Worldwide Export Clearance",
    detail: "Includes Japanese export certificate, de-registration, radiation inspection, and original Bill of Lading (B/L) documents sent via DHL express.",
  };
}

const ShippingEstimator = ({ car }: ShippingEstimatorProps) => {
  const [selectedPortId, setSelectedPortId] = useState<string>("us-la");

  const port = useMemo(() => {
    return destinationPorts.find((p) => p.id === selectedPortId) ?? destinationPorts[0];
  }, [selectedPortId]);

  const lot = car.auction;
  const fobPrice = lot ? lot.estimateLowUsd : car.priceUsd;
  const oceanFreight = port.oceanFreightUsd;
  const insurance = port.insuranceUsd;
  const inspection = port.inspectionUsd;
  const totalCif = fobPrice + oceanFreight + insurance + inspection;

  const compliance = useMemo(() => {
    return evaluateCompliance(port.countryCode, car.year);
  }, [port.countryCode, car.year]);

  const whatsAppMessage = encodeURIComponent(
    `Hello Neo Trading!\n\n` +
      `I'm interested in importing this vehicle:\n` +
      `• Vehicle: ${car.year} ${car.make} ${car.model}${car.grade ? ` ${car.grade}` : ""}\n` +
      `• Stock ID: ${car.id}\n` +
      `• FOB Japan: ${formatPrice(fobPrice)}\n` +
      `• Destination Port: ${port.portName}, ${port.country}\n` +
      `• Estimated Landed CIF: ${formatPrice(totalCif)}\n\n` +
      `Please provide the next vessel schedule and formal proforma invoice.`
  );

  const whatsAppUrl = `https://wa.me/${siteConfig.phoneRaw}?text=${whatsAppMessage}`;

  const copyEstimate = () => {
    const text =
      `${car.year} ${car.make} ${car.model} — Auto Import from Japan\n` +
      `FOB Price: ${formatPrice(fobPrice)}\n` +
      `Port: ${port.portName}, ${port.country} (${port.transitDays} transit)\n` +
      `Ocean Freight (RoRo): ${formatPrice(oceanFreight)}\n` +
      `Marine Insurance: ${formatPrice(insurance)}\n` +
      (inspection > 0 ? `${port.inspectionName || "Inspection"}: ${formatPrice(inspection)}\n` : "") +
      `Total Estimated CIF: ${formatPrice(totalCif)}\n` +
      `Link: ${window.location.href}`;

    navigator.clipboard.writeText(text);
    toast.success("Quote & vehicle details copied to clipboard!");
  };

  return (
    <div className="bg-card rounded-xl card-shadow border border-border p-6 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Instant Shipping & <span className="text-primary">Landed CIF Estimator</span>
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time RoRo ocean freight & insurance rates from Tokyo/Yokohama to your destination port.
          </p>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto bg-primary/10 text-primary border-primary/20">
          <Clock className="h-3 w-3 mr-1" />
          {port.transitDays}
        </Badge>
      </div>

      {/* Port Selector */}
      <div className="mb-5">
        <label htmlFor="destination-port-select" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Select Your Destination Port & Country
        </label>
        <Select value={selectedPortId} onValueChange={setSelectedPortId}>
          <SelectTrigger id="destination-port-select" className="w-full h-11 bg-background text-sm font-medium">
            <SelectValue placeholder="Select Destination Port" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <SelectGroup>
              <SelectLabel className="text-primary font-bold text-xs uppercase">🇺🇸 United States</SelectLabel>
              {destinationPorts.filter((p) => p.countryCode === "US").map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.portName} ({p.region}) — {p.transitDays}
                </SelectItem>
              ))}
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="text-primary font-bold text-xs uppercase">🇬🇧 United Kingdom</SelectLabel>
              {destinationPorts.filter((p) => p.countryCode === "UK").map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.portName} ({p.region}) — {p.transitDays}
                </SelectItem>
              ))}
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="text-primary font-bold text-xs uppercase">🇨🇦 Canada</SelectLabel>
              {destinationPorts.filter((p) => p.countryCode === "CA").map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.portName} ({p.region}) — {p.transitDays}
                </SelectItem>
              ))}
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="text-primary font-bold text-xs uppercase">🇦🇺 Australia</SelectLabel>
              {destinationPorts.filter((p) => p.countryCode === "AU").map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.portName} ({p.region}) — {p.transitDays}
                </SelectItem>
              ))}
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="text-primary font-bold text-xs uppercase">🇳🇿 New Zealand</SelectLabel>
              {destinationPorts.filter((p) => p.countryCode === "NZ").map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.portName} ({p.region}) — {p.transitDays}
                </SelectItem>
              ))}
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="text-primary font-bold text-xs uppercase">🌍 Other Global Hubs</SelectLabel>
              {destinationPorts.filter((p) => !["US", "UK", "CA", "AU", "NZ"].includes(p.countryCode)).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.country}: {p.portName} — {p.transitDays}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Country Compliance Callout */}
      <div
        className={`rounded-lg p-4 mb-5 border ${
          compliance.status === "eligible"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
            : compliance.status === "warning"
            ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
            : compliance.status === "ineligible"
            ? "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100"
            : "bg-primary/10 border-primary/20 text-foreground"
        }`}
      >
        <div className="flex items-start gap-3">
          {compliance.status === "eligible" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : compliance.status === "warning" ? (
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          ) : compliance.status === "ineligible" ? (
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-sm">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-bold">{compliance.headline}</span>
              <Badge
                variant="outline"
                className={`text-[11px] font-semibold ${
                  compliance.status === "eligible"
                    ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                    : compliance.status === "warning"
                    ? "border-amber-500/40 text-amber-700 dark:text-amber-300"
                    : "border-border text-muted-foreground"
                }`}
              >
                {compliance.badge}
              </Badge>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">{compliance.detail}</p>
          </div>
        </div>
      </div>

      {/* Itemized Cost Breakdown Table */}
      <div className="bg-secondary/40 rounded-lg p-4 border border-border/80 mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Estimated CIF Cost Breakdown to {port.portName}
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span>FOB Japan Price</span>
              <span className="text-[11px] text-muted-foreground/80">({car.location})</span>
            </span>
            <span className="font-medium text-foreground">{formatPrice(fobPrice)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span>RoRo Ocean Freight</span>
              <span className="text-[11px] text-muted-foreground/80">({port.transitDays})</span>
            </span>
            <span className="font-medium text-foreground">{formatPrice(oceanFreight)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span>All-Risks Marine Insurance</span>
              <span className="text-[11px] text-muted-foreground/80">(Full vehicle coverage)</span>
            </span>
            <span className="font-medium text-foreground">{formatPrice(insurance)}</span>
          </div>

          {inspection > 0 && (
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span>{port.inspectionName || "Pre-Export Inspection"}</span>
                <span className="text-[11px] text-muted-foreground/80">(Mandatory country certificate)</span>
              </span>
              <span className="font-medium text-foreground">{formatPrice(inspection)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 text-base font-bold text-foreground">
            <span className="flex items-center gap-1.5">
              <span className="text-primary font-display text-lg">Total Landed CIF</span>
              <span className="text-xs font-normal text-muted-foreground">({port.portName})</span>
            </span>
            <span className="text-2xl font-display font-extrabold text-primary">
              {formatPrice(totalCif)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border/50">
          <span>Departing Ports: Yokohama / Nagoya / Kobe / Kawasaki</span>
          <span>Sailings: 2–4 per month</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Button
          asChild
          className="h-11 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold gap-2 shadow-sm"
        >
          <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Inquire on WhatsApp (Pre-Filled)
          </a>
        </Button>

        <Button
          variant="outline"
          onClick={copyEstimate}
          className="h-11 gap-2 font-medium border-border hover:bg-secondary"
        >
          <Share2 className="h-4 w-4 text-muted-foreground" />
          Share / Copy CIF Quote
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground text-center mt-3">
        * Estimates exclude destination country local import duties, port terminal handling (THC), and customs broker fees.
      </p>
    </div>
  );
};

export default ShippingEstimator;
