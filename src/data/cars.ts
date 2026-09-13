/**
 * Stock inventory data model.
 *
 * This is the single source of truth for every vehicle on the site — listing
 * pages, make/model pages, search and detail pages all read from here.
 * When a real backend arrives, swap the arrays below for API calls; the
 * helper functions and the `Car` shape are what the components depend on.
 */

export type Fuel = "Petrol" | "Diesel" | "Hybrid" | "Electric" | "LPG";
export type Transmission = "Automatic" | "Manual" | "CVT";
export type Drive = "2WD" | "4WD" | "AWD";
export type Steering = "Right" | "Left";

/** An upcoming auction lot we can bid on for a customer. */
export interface AuctionLot {
  /** Auction house and branch, e.g. "USS Nagoya". */
  house: string;
  lotNumber: string;
  /** ISO date the lot goes under the hammer. */
  date: string;
  /** Estimated hammer range in USD — what we expect the bidding to land at. */
  estimateLowUsd: number;
  estimateHighUsd: number;
}

export type ListingType = "stock" | "auction";

export interface Car {
  /** Stock number — also the URL segment: /stock-cars/toyota/prado/NEO-1042 */
  id: string;
  make: string;
  model: string;
  /** Trim / grade, e.g. "TX L Package" */
  grade?: string;
  year: number;
  /** FOB price in USD. */
  priceUsd: number;
  mileageKm: number;
  fuel: Fuel;
  transmission: Transmission;
  drive: Drive;
  engineCc: number;
  bodyType: string;
  color: string;
  doors: number;
  seats: number;
  steering: Steering;
  /** Auction/inspection grade, e.g. "4.5/B". */
  condition?: string;
  chassisCode?: string;
  /** Japanese port the unit ships from. */
  location: string;
  images: string[];
  /** Collection slugs this car belongs to. */
  collections: string[];
  featured?: boolean;
  /** ISO date — drives "New Arrivals" ordering and the NEW badge. */
  arrivedAt: string;
  /**
   * Present only on auction lots. Stock we already own leaves this undefined,
   * which is what `listingTypeOf` keys off.
   */
  auction?: AuctionLot;
}

/** Turns "Land Cruiser Prado" into "land-cruiser-prado" for URLs. */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export interface Collection {
  slug: string;
  name: string;
  description: string;
}

export const collections: Collection[] = [
  {
    slug: "jdm-sports-cars",
    name: "JDM Sports Cars",
    description:
      "Icons of the Japanese domestic market — coupes and performance saloons built for the enthusiast.",
  },
  {
    slug: "kei-trucks-vans",
    name: "Kei Trucks & Vans",
    description:
      "Compact, economical and endlessly practical. Japan's 660cc workhorses, ready for export.",
  },
  {
    slug: "suv-4x4",
    name: "SUV & 4x4",
    description:
      "Proven off-roaders and family SUVs, inspected and prepared for rough roads anywhere.",
  },
  {
    slug: "hybrid-eco",
    name: "Hybrid & Eco",
    description: "Low-emission hybrids with outstanding fuel economy and low running costs.",
  },
];

// Shared photo pool for seed data. Replace each car's `images` with real
// photographs of the actual unit before going live.
const img = {
  suvSilver: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop",
  suvWhite: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop",
  suvBlue: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
  crossover: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&h=600&fit=crop",
  sportsRed: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
  sportsWhite: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
  sedanBlack: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&h=600&fit=crop",
  sedanSilver: "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=800&h=600&fit=crop",
  van: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop",
  hatch: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
  truck: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  interior: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&h=600&fit=crop",
};

export const cars: Car[] = [
  {
    id: "NEO-1042",
    make: "Toyota",
    model: "Land Cruiser Prado",
    grade: "TX L Package",
    year: 2020,
    priceUsd: 28500,
    mileageKm: 45000,
    fuel: "Diesel",
    transmission: "Automatic",
    drive: "4WD",
    engineCc: 2800,
    bodyType: "SUV",
    color: "Pearl White",
    doors: 5,
    seats: 7,
    steering: "Right",
    condition: "4.5/B",
    chassisCode: "GDJ150W",
    location: "Yokohama",
    images: [img.suvSilver, img.interior, img.suvWhite],
    collections: ["suv-4x4"],
    featured: true,
    arrivedAt: "2026-09-01",
  },
  {
    id: "NEO-1043",
    make: "Honda",
    model: "CR-V",
    grade: "EX Masterpiece",
    year: 2019,
    priceUsd: 19800,
    mileageKm: 62000,
    fuel: "Petrol",
    transmission: "CVT",
    drive: "4WD",
    engineCc: 1500,
    bodyType: "SUV",
    color: "Lunar Silver",
    doors: 5,
    seats: 5,
    steering: "Right",
    condition: "4/B",
    chassisCode: "RW1",
    location: "Nagoya",
    images: [img.suvWhite, img.interior],
    collections: ["suv-4x4"],
    featured: true,
    arrivedAt: "2026-08-30",
  },
  {
    id: "NEO-1044",
    make: "Nissan",
    model: "X-Trail",
    grade: "20X Hybrid",
    year: 2021,
    priceUsd: 22300,
    mileageKm: 32000,
    fuel: "Hybrid",
    transmission: "CVT",
    drive: "4WD",
    engineCc: 2000,
    bodyType: "SUV",
    color: "Gun Metallic",
    doors: 5,
    seats: 5,
    steering: "Right",
    condition: "4.5/B",
    chassisCode: "HNT32",
    location: "Yokohama",
    images: [img.suvBlue, img.interior],
    collections: ["suv-4x4", "hybrid-eco"],
    featured: true,
    arrivedAt: "2026-08-28",
  },
  {
    id: "NEO-1045",
    make: "Mazda",
    model: "CX-5",
    grade: "25S L Package",
    year: 2020,
    priceUsd: 24900,
    mileageKm: 38000,
    fuel: "Petrol",
    transmission: "Automatic",
    drive: "AWD",
    engineCc: 2500,
    bodyType: "SUV",
    color: "Soul Red",
    doors: 5,
    seats: 5,
    steering: "Right",
    condition: "4.5/A",
    chassisCode: "KF5P",
    location: "Kobe",
    images: [img.crossover, img.interior],
    collections: ["suv-4x4"],
    featured: true,
    arrivedAt: "2026-08-27",
  },
  {
    id: "NEO-1046",
    make: "Toyota",
    model: "Hiace",
    grade: "Super GL Long",
    year: 2018,
    priceUsd: 26400,
    mileageKm: 88000,
    fuel: "Diesel",
    transmission: "Automatic",
    drive: "2WD",
    engineCc: 2800,
    bodyType: "Van",
    color: "White",
    doors: 5,
    seats: 6,
    steering: "Right",
    condition: "4/B",
    chassisCode: "GDH201V",
    location: "Osaka",
    images: [img.van],
    collections: ["kei-trucks-vans"],
    arrivedAt: "2026-08-25",
  },
  {
    id: "NEO-1047",
    make: "Toyota",
    model: "Aqua",
    grade: "S Style Black",
    year: 2019,
    priceUsd: 9800,
    mileageKm: 54000,
    fuel: "Hybrid",
    transmission: "CVT",
    drive: "2WD",
    engineCc: 1500,
    bodyType: "Hatchback",
    color: "Black Mica",
    doors: 5,
    seats: 5,
    steering: "Right",
    condition: "4/B",
    chassisCode: "NHP10",
    location: "Nagoya",
    images: [img.hatch],
    collections: ["hybrid-eco"],
    arrivedAt: "2026-08-24",
  },
  {
    id: "NEO-1048",
    make: "Nissan",
    model: "Skyline GT-R",
    grade: "V-Spec",
    year: 1999,
    priceUsd: 68000,
    mileageKm: 92000,
    fuel: "Petrol",
    transmission: "Manual",
    drive: "4WD",
    engineCc: 2600,
    bodyType: "Coupe",
    color: "Bayside Blue",
    doors: 2,
    seats: 4,
    steering: "Right",
    condition: "4/B",
    chassisCode: "BNR34",
    location: "Yokohama",
    images: [img.sportsRed, img.interior],
    collections: ["jdm-sports-cars"],
    featured: true,
    arrivedAt: "2026-08-22",
  },
  {
    id: "NEO-1049",
    make: "Subaru",
    model: "Impreza WRX STI",
    grade: "Type RA",
    year: 2004,
    priceUsd: 21500,
    mileageKm: 118000,
    fuel: "Petrol",
    transmission: "Manual",
    drive: "AWD",
    engineCc: 2000,
    bodyType: "Sedan",
    color: "World Rally Blue",
    doors: 4,
    seats: 5,
    steering: "Right",
    condition: "3.5/B",
    chassisCode: "GDB",
    location: "Kobe",
    images: [img.sedanBlack],
    collections: ["jdm-sports-cars"],
    arrivedAt: "2026-08-20",
  },
  {
    id: "NEO-1050",
    make: "Mitsubishi",
    model: "Lancer Evolution",
    grade: "Evolution IX GSR",
    year: 2006,
    priceUsd: 34800,
    mileageKm: 96000,
    fuel: "Petrol",
    transmission: "Manual",
    drive: "AWD",
    engineCc: 2000,
    bodyType: "Sedan",
    color: "Rally Red",
    doors: 4,
    seats: 5,
    steering: "Right",
    condition: "4/B",
    chassisCode: "CT9A",
    location: "Osaka",
    images: [img.sedanSilver],
    collections: ["jdm-sports-cars"],
    arrivedAt: "2026-08-19",
  },
  {
    id: "NEO-1051",
    make: "Daihatsu",
    model: "Hijet Truck",
    grade: "Standard 4WD",
    year: 2017,
    priceUsd: 7200,
    mileageKm: 64000,
    fuel: "Petrol",
    transmission: "Manual",
    drive: "4WD",
    engineCc: 660,
    bodyType: "Kei Truck",
    color: "White",
    doors: 2,
    seats: 2,
    steering: "Right",
    condition: "4/B",
    chassisCode: "S510P",
    location: "Fukuoka",
    images: [img.truck],
    collections: ["kei-trucks-vans"],
    arrivedAt: "2026-08-18",
  },
  {
    id: "NEO-1052",
    make: "Suzuki",
    model: "Every Wagon",
    grade: "JP Turbo",
    year: 2019,
    priceUsd: 8900,
    mileageKm: 41000,
    fuel: "Petrol",
    transmission: "Automatic",
    drive: "2WD",
    engineCc: 660,
    bodyType: "Kei Van",
    color: "Silver",
    doors: 5,
    seats: 4,
    steering: "Right",
    condition: "4.5/B",
    chassisCode: "DA17W",
    location: "Fukuoka",
    images: [img.van],
    collections: ["kei-trucks-vans"],
    arrivedAt: "2026-08-16",
  },
  {
    id: "NEO-1053",
    make: "Toyota",
    model: "Land Cruiser Prado",
    grade: "TZ-G",
    year: 2017,
    priceUsd: 32900,
    mileageKm: 71000,
    fuel: "Diesel",
    transmission: "Automatic",
    drive: "4WD",
    engineCc: 2800,
    bodyType: "SUV",
    color: "Black",
    doors: 5,
    seats: 7,
    steering: "Right",
    condition: "4/B",
    chassisCode: "GDJ150W",
    location: "Yokohama",
    images: [img.suvSilver],
    collections: ["suv-4x4"],
    arrivedAt: "2026-08-15",
  },
  {
    id: "NEO-1054",
    make: "Honda",
    model: "Fit",
    grade: "Hybrid F Package",
    year: 2020,
    priceUsd: 10400,
    mileageKm: 36000,
    fuel: "Hybrid",
    transmission: "CVT",
    drive: "2WD",
    engineCc: 1500,
    bodyType: "Hatchback",
    color: "Blue",
    doors: 5,
    seats: 5,
    steering: "Right",
    condition: "4.5/A",
    chassisCode: "GP5",
    location: "Nagoya",
    images: [img.hatch],
    collections: ["hybrid-eco"],
    arrivedAt: "2026-08-14",
  },
  {
    id: "NEO-1055",
    make: "Nissan",
    model: "Note",
    grade: "e-POWER Medalist",
    year: 2021,
    priceUsd: 12600,
    mileageKm: 28000,
    fuel: "Hybrid",
    transmission: "Automatic",
    drive: "2WD",
    engineCc: 1200,
    bodyType: "Hatchback",
    color: "Pearl White",
    doors: 5,
    seats: 5,
    steering: "Right",
    condition: "5/A",
    chassisCode: "HE12",
    location: "Kobe",
    images: [img.hatch],
    collections: ["hybrid-eco"],
    arrivedAt: "2026-08-12",
  },
  {
    id: "NEO-1056",
    make: "Mazda",
    model: "RX-7",
    grade: "Type RS",
    year: 1999,
    priceUsd: 42000,
    mileageKm: 104000,
    fuel: "Petrol",
    transmission: "Manual",
    drive: "2WD",
    engineCc: 1300,
    bodyType: "Coupe",
    color: "Innocent Blue",
    doors: 2,
    seats: 4,
    steering: "Right",
    condition: "4/C",
    chassisCode: "FD3S",
    location: "Osaka",
    images: [img.sportsWhite],
    collections: ["jdm-sports-cars"],
    arrivedAt: "2026-08-10",
  },
  {
    id: "NEO-1057",
    make: "Toyota",
    model: "Hilux",
    grade: "Z Black Rally Edition",
    year: 2021,
    priceUsd: 31200,
    mileageKm: 39000,
    fuel: "Diesel",
    transmission: "Automatic",
    drive: "4WD",
    engineCc: 2400,
    bodyType: "Pickup",
    color: "Attitude Black",
    doors: 4,
    seats: 5,
    steering: "Right",
    condition: "4.5/B",
    chassisCode: "GUN125",
    location: "Yokohama",
    images: [img.truck],
    collections: ["suv-4x4"],
    arrivedAt: "2026-08-09",
  },
  {
    id: "NEO-1058",
    make: "Subaru",
    model: "Forester",
    grade: "X-Break",
    year: 2018,
    priceUsd: 18700,
    mileageKm: 58000,
    fuel: "Petrol",
    transmission: "CVT",
    drive: "AWD",
    engineCc: 2000,
    bodyType: "SUV",
    color: "Jasper Green",
    doors: 5,
    seats: 5,
    steering: "Right",
    condition: "4/B",
    chassisCode: "SK9",
    location: "Nagoya",
    images: [img.suvBlue],
    collections: ["suv-4x4"],
    arrivedAt: "2026-08-07",
  },
  {
    id: "NEO-1059",
    make: "Lexus",
    model: "RX",
    grade: "300 F Sport",
    year: 2020,
    priceUsd: 39500,
    mileageKm: 34000,
    fuel: "Petrol",
    transmission: "Automatic",
    drive: "AWD",
    engineCc: 2000,
    bodyType: "SUV",
    color: "Sonic Titanium",
    doors: 5,
    seats: 5,
    steering: "Right",
    condition: "5/A",
    chassisCode: "AGL25W",
    location: "Yokohama",
    images: [img.crossover, img.interior],
    collections: ["suv-4x4"],
    arrivedAt: "2026-08-05",
  },

  /* ---------------------------------------------------------------- */
  /* Auction lots — not owned stock. `priceUsd` mirrors the low        */
  /* estimate so price sorting and filtering behave the same way.      */
  /* ---------------------------------------------------------------- */
  {
    id: "AUC-40231",
    make: "Toyota",
    model: "Alphard",
    grade: "2.5 S C Package",
    year: 2019,
    priceUsd: 21000,
    mileageKm: 48000,
    fuel: "Petrol",
    transmission: "CVT",
    drive: "2WD",
    engineCc: 2500,
    bodyType: "Minivan",
    color: "Pearl White",
    doors: 5,
    seats: 7,
    steering: "Right",
    condition: "4.5/B",
    chassisCode: "AGH30W",
    location: "Nagoya",
    images: [img.van, img.interior],
    collections: [],
    arrivedAt: "2026-09-08",
    auction: {
      house: "USS Nagoya",
      lotNumber: "40231",
      date: "2026-09-12",
      estimateLowUsd: 21000,
      estimateHighUsd: 24000,
    },
  },
  {
    id: "AUC-40522",
    make: "Suzuki",
    model: "Jimny",
    grade: "XC 4WD",
    year: 2021,
    priceUsd: 15500,
    mileageKm: 21000,
    fuel: "Petrol",
    transmission: "Manual",
    drive: "4WD",
    engineCc: 660,
    bodyType: "SUV",
    color: "Jungle Green",
    doors: 3,
    seats: 4,
    steering: "Right",
    condition: "5/A",
    chassisCode: "JB64W",
    location: "Tokyo",
    images: [img.suvBlue],
    collections: [],
    arrivedAt: "2026-09-07",
    auction: {
      house: "USS Tokyo",
      lotNumber: "40522",
      date: "2026-09-13",
      estimateLowUsd: 15500,
      estimateHighUsd: 18200,
    },
  },
  {
    id: "AUC-41077",
    make: "Honda",
    model: "Vezel",
    grade: "Hybrid Z Honda Sensing",
    year: 2020,
    priceUsd: 13400,
    mileageKm: 39000,
    fuel: "Hybrid",
    transmission: "Automatic",
    drive: "2WD",
    engineCc: 1500,
    bodyType: "SUV",
    color: "Lunar Silver",
    doors: 5,
    seats: 5,
    steering: "Right",
    condition: "4/B",
    chassisCode: "RU3",
    location: "Kobe",
    images: [img.crossover],
    collections: [],
    arrivedAt: "2026-09-07",
    auction: {
      house: "HAA Kobe",
      lotNumber: "41077",
      date: "2026-09-15",
      estimateLowUsd: 13400,
      estimateHighUsd: 15100,
    },
  },
  {
    id: "AUC-41310",
    make: "Nissan",
    model: "Serena",
    grade: "Highway Star e-POWER",
    year: 2019,
    priceUsd: 12800,
    mileageKm: 66000,
    fuel: "Hybrid",
    transmission: "Automatic",
    drive: "2WD",
    engineCc: 1200,
    bodyType: "Minivan",
    color: "Black",
    doors: 5,
    seats: 8,
    steering: "Right",
    condition: "4/B",
    chassisCode: "HFC27",
    location: "Yokohama",
    images: [img.van],
    collections: [],
    arrivedAt: "2026-09-06",
    auction: {
      house: "TAA Yokohama",
      lotNumber: "41310",
      date: "2026-09-16",
      estimateLowUsd: 12800,
      estimateHighUsd: 14600,
    },
  },
  {
    id: "AUC-41654",
    make: "Mitsubishi",
    model: "Delica D:5",
    grade: "P Diesel 4WD",
    year: 2020,
    priceUsd: 26500,
    mileageKm: 52000,
    fuel: "Diesel",
    transmission: "Automatic",
    drive: "4WD",
    engineCc: 2300,
    bodyType: "Minivan",
    color: "White Pearl",
    doors: 5,
    seats: 8,
    steering: "Right",
    condition: "4.5/B",
    chassisCode: "CV1W",
    location: "Gifu",
    images: [img.suvWhite],
    collections: [],
    arrivedAt: "2026-09-06",
    auction: {
      house: "JU Gifu",
      lotNumber: "41654",
      date: "2026-09-18",
      estimateLowUsd: 26500,
      estimateHighUsd: 29800,
    },
  },
  {
    id: "AUC-41902",
    make: "Subaru",
    model: "Levorg",
    grade: "1.6 GT-S EyeSight",
    year: 2018,
    priceUsd: 11200,
    mileageKm: 78000,
    fuel: "Petrol",
    transmission: "CVT",
    drive: "AWD",
    engineCc: 1600,
    bodyType: "Wagon",
    color: "WR Blue",
    doors: 5,
    seats: 5,
    steering: "Right",
    condition: "4/B",
    chassisCode: "VM4",
    location: "Yokohama",
    images: [img.sedanSilver],
    collections: [],
    arrivedAt: "2026-09-05",
    auction: {
      house: "ARAI Bayside",
      lotNumber: "41902",
      date: "2026-09-19",
      estimateLowUsd: 11200,
      estimateHighUsd: 12900,
    },
  },
  {
    id: "AUC-42188",
    make: "Toyota",
    model: "Corolla Fielder",
    grade: "Hybrid G WxB",
    year: 2018,
    priceUsd: 8600,
    mileageKm: 84000,
    fuel: "Hybrid",
    transmission: "CVT",
    drive: "2WD",
    engineCc: 1500,
    bodyType: "Wagon",
    color: "Silver Metallic",
    doors: 5,
    seats: 5,
    steering: "Right",
    condition: "3.5/B",
    chassisCode: "NKE165G",
    location: "Osaka",
    images: [img.hatch],
    collections: [],
    arrivedAt: "2026-09-05",
    auction: {
      house: "USS Osaka",
      lotNumber: "42188",
      date: "2026-09-20",
      estimateLowUsd: 8600,
      estimateHighUsd: 9900,
    },
  },
  {
    id: "AUC-42450",
    make: "Mazda",
    model: "Roadster",
    grade: "S Special Package",
    year: 2017,
    priceUsd: 17400,
    mileageKm: 43000,
    fuel: "Petrol",
    transmission: "Manual",
    drive: "2WD",
    engineCc: 1500,
    bodyType: "Convertible",
    color: "Soul Red",
    doors: 2,
    seats: 2,
    steering: "Right",
    condition: "4.5/A",
    chassisCode: "ND5RC",
    location: "Fukuoka",
    images: [img.sportsRed],
    collections: [],
    arrivedAt: "2026-09-04",
    auction: {
      house: "USS Fukuoka",
      lotNumber: "42450",
      date: "2026-09-22",
      estimateLowUsd: 17400,
      estimateHighUsd: 19800,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Query helpers — components use these instead of touching the array. */
/* ------------------------------------------------------------------ */

/** Stock we own versus a lot we would bid on. */
export const listingTypeOf = (car: Car): ListingType => (car.auction ? "auction" : "stock");

export const listingsOfType = (type: ListingType = "stock"): Car[] =>
  cars.filter((car) => listingTypeOf(car) === type);

export interface MakeSummary {
  name: string;
  slug: string;
  count: number;
}

/** Every make present in the given listing type, alphabetical, with unit counts. */
export const getMakes = (type: ListingType = "stock"): MakeSummary[] => {
  const counts = new Map<string, number>();
  listingsOfType(type).forEach((car) => counts.set(car.make, (counts.get(car.make) ?? 0) + 1));
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/** Models available for a given make slug. */
export const getModels = (makeSlug: string, type: ListingType = "stock"): MakeSummary[] => {
  const counts = new Map<string, number>();
  listingsOfType(type)
    .filter((car) => slugify(car.make) === makeSlug)
    .forEach((car) => counts.set(car.model, (counts.get(car.model) ?? 0) + 1));
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getMakeName = (makeSlug: string): string | undefined =>
  cars.find((car) => slugify(car.make) === makeSlug)?.make;

export const getModelName = (makeSlug: string, modelSlug: string): string | undefined =>
  cars.find(
    (car) => slugify(car.make) === makeSlug && slugify(car.model) === modelSlug
  )?.model;

export const getCarById = (id: string): Car | undefined =>
  cars.find((car) => car.id.toLowerCase() === id.toLowerCase());

export interface CarFilters {
  /** Which side of the business to search. Defaults to owned stock. */
  listingType?: ListingType;
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceMin?: number;
  priceMax?: number;
  /** Upper bound on the odometer reading, in km. */
  mileageMax?: number;
  engineMin?: number;
  engineMax?: number;
  /** Multi-select facets — a car matches when its own value is in the list. */
  bodyTypes?: string[];
  fuels?: string[];
  transmissions?: string[];
  drives?: string[];
  steerings?: string[];
  /** Colour families (see `colorFamily`), not raw paint names. */
  colors?: string[];
  locations?: string[];
  /** Auction houses — only meaningful on the auction side. */
  houses?: string[];
  collection?: string;
  /** Free text across stock id, make, model and grade. */
  q?: string;
}

/** The multi-select facets the search sidebar exposes, in sidebar order. */
export type FacetKey =
  | "bodyTypes"
  | "fuels"
  | "transmissions"
  | "drives"
  | "steerings"
  | "colors"
  | "locations"
  | "houses";

export const facetTitles: Record<FacetKey, string> = {
  bodyTypes: "Body Type",
  fuels: "Fuel",
  transmissions: "Transmission",
  drives: "Drive",
  steerings: "Steering",
  colors: "Colour",
  locations: "Port",
  houses: "Auction House",
};

/**
 * Raw paint names ("Bayside Blue", "Sonic Titanium") are far too granular to
 * filter on, so every car is bucketed into a broad colour family instead.
 * Order matters: the first family whose keyword appears wins.
 */
const colorFamilies: { value: string; label: string; keywords: string[] }[] = [
  { value: "white", label: "White", keywords: ["white", "pearl"] },
  { value: "black", label: "Black", keywords: ["black", "attitude"] },
  { value: "silver", label: "Silver", keywords: ["silver", "titanium"] },
  { value: "grey", label: "Grey", keywords: ["grey", "gray", "metallic", "gun"] },
  { value: "blue", label: "Blue", keywords: ["blue"] },
  { value: "red", label: "Red", keywords: ["red", "burgundy", "maroon"] },
  { value: "green", label: "Green", keywords: ["green", "jasper"] },
  { value: "brown", label: "Brown", keywords: ["brown", "beige", "bronze"] },
  { value: "yellow", label: "Yellow", keywords: ["yellow", "gold"] },
];

export const colorFamily = (color: string): string => {
  const value = color.toLowerCase();
  return (
    colorFamilies.find((family) => family.keywords.some((word) => value.includes(word)))
      ?.value ?? "other"
  );
};

export const colorFamilyLabel = (value: string): string =>
  colorFamilies.find((family) => family.value === value)?.label ?? "Other";

/** The value a car contributes to a given facet. */
const facetValue = (car: Car, key: FacetKey): string => {
  switch (key) {
    case "bodyTypes":
      return car.bodyType;
    case "fuels":
      return car.fuel;
    case "transmissions":
      return car.transmission;
    case "drives":
      return car.drive;
    case "steerings":
      return car.steering;
    case "colors":
      return colorFamily(car.color);
    case "locations":
      return car.location;
    case "houses":
      return car.auction?.house ?? "—";
  }
};

export const facetOptionLabel = (key: FacetKey, value: string): string => {
  if (key === "colors") return colorFamilyLabel(value);
  if (key === "steerings") return `${value} hand drive`;
  return value;
};

const matchesCar = (car: Car, filters: CarFilters): boolean => {
  if (listingTypeOf(car) !== (filters.listingType ?? "stock")) return false;
  if (filters.make && slugify(car.make) !== filters.make) return false;
  if (filters.model && slugify(car.model) !== filters.model) return false;
  if (filters.yearFrom && car.year < filters.yearFrom) return false;
  if (filters.yearTo && car.year > filters.yearTo) return false;
  if (filters.priceMin !== undefined && car.priceUsd < filters.priceMin) return false;
  if (filters.priceMax !== undefined && car.priceUsd > filters.priceMax) return false;
  if (filters.mileageMax !== undefined && car.mileageKm > filters.mileageMax) return false;
  if (filters.engineMin !== undefined && car.engineCc < filters.engineMin) return false;
  if (filters.engineMax !== undefined && car.engineCc > filters.engineMax) return false;
  if (filters.collection && !car.collections.includes(filters.collection)) return false;

  const facets: FacetKey[] = [
    "bodyTypes",
    "fuels",
    "transmissions",
    "drives",
    "steerings",
    "colors",
    "locations",
    "houses",
  ];
  for (const key of facets) {
    const selected = filters[key];
    if (selected?.length && !selected.includes(facetValue(car, key))) return false;
  }

  const query = filters.q?.trim().toLowerCase();
  if (query) {
    const haystack =
      `${car.id} ${car.make} ${car.model} ${car.grade ?? ""} ${car.bodyType} ${car.color}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  return true;
};

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

/**
 * Options for one facet, counted against every *other* active filter — the
 * number tells you what you would get by ticking the box. Options that lead
 * nowhere still appear (with a zero) rather than disappearing under you.
 */
export const getFacetOptions = (key: FacetKey, filters: CarFilters = {}): FacetOption[] => {
  const others: CarFilters = { ...filters, [key]: undefined };
  const counts = new Map<string, number>();

  listingsOfType(filters.listingType ?? "stock").forEach((car) => {
    const value = facetValue(car, key);
    const current = counts.get(value) ?? 0;
    counts.set(value, current + (matchesCar(car, others) ? 1 : 0));
  });

  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: facetOptionLabel(key, value), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

export type SortKey =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "year-desc"
  | "year-asc"
  | "mileage-asc"
  | "auction-soon";

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "year-desc", label: "Year: newest first" },
  { value: "year-asc", label: "Year: oldest first" },
  { value: "mileage-asc", label: "Mileage: lowest first" },
  { value: "auction-soon", label: "Auction date: soonest" },
];

/** Sorting by auction date only makes sense on the auction tab. */
export const sortOptionsFor = (type: ListingType): { value: SortKey; label: string }[] =>
  sortOptions.filter((option) => option.value !== "auction-soon" || type === "auction");

export const filterCars = (filters: CarFilters = {}, sort: SortKey = "newest"): Car[] => {
  const result = cars.filter((car) => matchesCar(car, filters));

  const sorters: Record<SortKey, (a: Car, b: Car) => number> = {
    newest: (a, b) => b.arrivedAt.localeCompare(a.arrivedAt),
    "price-asc": (a, b) => a.priceUsd - b.priceUsd,
    "price-desc": (a, b) => b.priceUsd - a.priceUsd,
    "year-desc": (a, b) => b.year - a.year,
    "year-asc": (a, b) => a.year - b.year,
    "mileage-asc": (a, b) => a.mileageKm - b.mileageKm,
    "auction-soon": (a, b) =>
      (a.auction?.date ?? "9999").localeCompare(b.auction?.date ?? "9999"),
  };

  return [...result].sort(sorters[sort]);
};

export const getFeaturedCars = (limit = 4): Car[] =>
  filterCars({}, "newest")
    .filter((car) => car.featured)
    .slice(0, limit);

/** Same make and same listing type, excluding the car itself — detail page. */
export const getRelatedCars = (car: Car, limit = 4): Car[] =>
  listingsOfType(listingTypeOf(car))
    .filter((c) => c.make === car.make && c.id !== car.id)
    .slice(0, limit);

/* Formatting helpers */

export const formatPrice = (usd: number): string =>
  `$${usd.toLocaleString("en-US")}`;

export const formatMileage = (km: number): string =>
  `${km.toLocaleString("en-US")} km`;

/** Path to a car's detail page. */
export const carPath = (car: Car): string =>
  `/stock-cars/${slugify(car.make)}/${slugify(car.model)}/${car.id}`;

/** Was this unit added in the last 21 days? */
export const isNewArrival = (car: Car): boolean => {
  const days = (Date.now() - new Date(car.arrivedAt).getTime()) / 86_400_000;
  return days <= 21;
};

/** Price bands used by the search filters. */
export const priceBands = [
  { value: "0-5000", label: "Under $5,000", min: 0, max: 5000 },
  { value: "5000-10000", label: "$5,000 - $10,000", min: 5000, max: 10000 },
  { value: "10000-20000", label: "$10,000 - $20,000", min: 10000, max: 20000 },
  { value: "20000-30000", label: "$20,000 - $30,000", min: 20000, max: 30000 },
  { value: "30000-", label: "Over $30,000", min: 30000, max: undefined },
] as const;

/** Years covered by the current inventory, newest first. */
export const getYearRange = (): number[] => {
  const years = cars.map((car) => car.year);
  const min = Math.min(...years);
  const max = Math.max(...years);
  return Array.from({ length: max - min + 1 }, (_, i) => max - i);
};

/** Ladder of round FOB amounts backing the min/max price selects. */
export const priceLadder = [
  1000, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000,
];

/** Odometer ceilings offered in the sidebar. */
export const mileageBands = [
  { value: "30000", label: "Under 30,000 km", max: 30000 },
  { value: "50000", label: "Under 50,000 km", max: 50000 },
  { value: "80000", label: "Under 80,000 km", max: 80000 },
  { value: "100000", label: "Under 100,000 km", max: 100000 },
  { value: "150000", label: "Under 150,000 km", max: 150000 },
] as const;

/** Engine displacement bands, matching how buyers shop (kei, compact, …). */
export const engineBands = [
  { value: "0-660", label: "Kei — up to 660cc", min: 0, max: 660 },
  { value: "661-1500", label: "661 – 1,500cc", min: 661, max: 1500 },
  { value: "1501-2000", label: "1,501 – 2,000cc", min: 1501, max: 2000 },
  { value: "2001-3000", label: "2,001 – 3,000cc", min: 2001, max: 3000 },
  { value: "3001-", label: "Over 3,000cc", min: 3001, max: undefined },
] as const;

export const formatEngine = (cc: number): string => `${(cc / 1000).toFixed(1)}L`;

/** "$21,000 – $24,000" — the expected hammer range for an auction lot. */
export const formatEstimate = (lot: AuctionLot): string =>
  `${formatPrice(lot.estimateLowUsd)} – ${formatPrice(lot.estimateHighUsd)}`;

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * "Sat 12 Sep" — auction dates are always near-term, so the year is noise.
 * Formatted by hand rather than via `toLocaleDateString`, whose abbreviations
 * shift between locales and runtimes ("Sep" vs "Sept").
 */
export const formatAuctionDate = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00`);
  return `${weekdayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]}`;
};
