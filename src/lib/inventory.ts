/**
 * The stock list, as stored in the `vehicles` table.
 *
 * The public site never calls this directly: src/bootstrap.ts loads the list
 * once and hands it to `setInventory` in src/data/cars.ts, which is what every
 * page reads. The admin half below edits the table and then pushes the result
 * back through `setInventory`, so the site reflects a change without a reload.
 *
 * Access is enforced by RLS (supabase/schema.sql): the public reads published
 * rows, the team reads and writes everything, only managers delete.
 */
import {
  Car,
  Drive,
  Fuel,
  SaleStatus,
  Steering,
  Transmission,
  setInventory,
} from "@/data/cars";
import { supabase } from "@/lib/supabase";

/** Every value the admin form offers for the enum-like columns. */
export const fuels: Fuel[] = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
export const transmissions: Transmission[] = ["Automatic", "Manual", "CVT"];
export const drives: Drive[] = ["2WD", "4WD", "AWD"];
export const steerings: Steering[] = ["Right", "Left"];
export const saleStatuses: SaleStatus[] = ["available", "reserved", "sold"];

const BUCKET = "vehicle-images";

type VehicleRow = {
  id: string;
  make: string;
  model: string;
  grade: string | null;
  year: number;
  price_usd: number;
  mileage_km: number;
  fuel: Fuel;
  transmission: Transmission;
  drive: Drive;
  engine_cc: number;
  body_type: string;
  color: string;
  doors: number;
  seats: number;
  steering: Steering;
  condition: string | null;
  chassis_code: string | null;
  location: string;
  images: string[];
  collections: string[];
  featured: boolean;
  arrived_at: string;
  status: SaleStatus;
  published: boolean;
  auction_house: string | null;
  auction_lot_number: string | null;
  auction_date: string | null;
  auction_estimate_low: number | null;
  auction_estimate_high: number | null;
};

const fromRow = (row: VehicleRow): Car => ({
  id: row.id,
  make: row.make,
  model: row.model,
  grade: row.grade ?? undefined,
  year: row.year,
  priceUsd: row.price_usd,
  mileageKm: row.mileage_km,
  fuel: row.fuel,
  transmission: row.transmission,
  drive: row.drive,
  engineCc: row.engine_cc,
  bodyType: row.body_type,
  color: row.color,
  doors: row.doors,
  seats: row.seats,
  steering: row.steering,
  condition: row.condition ?? undefined,
  chassisCode: row.chassis_code ?? undefined,
  location: row.location,
  images: row.images ?? [],
  collections: row.collections ?? [],
  featured: row.featured,
  arrivedAt: row.arrived_at,
  status: row.status,
  published: row.published,
  auction:
    row.auction_house && row.auction_lot_number && row.auction_date
      ? {
          house: row.auction_house,
          lotNumber: row.auction_lot_number,
          date: row.auction_date,
          estimateLowUsd: row.auction_estimate_low ?? 0,
          estimateHighUsd: row.auction_estimate_high ?? 0,
        }
      : undefined,
});

const toRow = (car: Car): VehicleRow => ({
  id: car.id.trim(),
  make: car.make.trim(),
  model: car.model.trim(),
  grade: car.grade?.trim() || null,
  year: car.year,
  price_usd: car.priceUsd,
  mileage_km: car.mileageKm,
  fuel: car.fuel,
  transmission: car.transmission,
  drive: car.drive,
  engine_cc: car.engineCc,
  body_type: car.bodyType.trim(),
  color: car.color.trim(),
  doors: car.doors,
  seats: car.seats,
  steering: car.steering,
  condition: car.condition?.trim() || null,
  chassis_code: car.chassisCode?.trim() || null,
  location: car.location.trim(),
  images: car.images,
  collections: car.collections,
  featured: Boolean(car.featured),
  arrived_at: car.arrivedAt,
  status: car.status ?? "available",
  published: car.published !== false,
  auction_house: car.auction?.house.trim() ?? null,
  auction_lot_number: car.auction?.lotNumber.trim() ?? null,
  auction_date: car.auction?.date ?? null,
  auction_estimate_low: car.auction?.estimateLowUsd ?? null,
  auction_estimate_high: car.auction?.estimateHighUsd ?? null,
});

const client = () => {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
};

/**
 * Everything the caller is allowed to see: published rows for the public, the
 * whole table for the team. Newest arrivals first, matching the default sort.
 */
export const fetchInventory = async (): Promise<Car[]> => {
  const { data, error } = await client()
    .from("vehicles")
    .select("*")
    .order("arrived_at", { ascending: false });

  if (error) throw error;
  return (data as VehicleRow[]).map(fromRow);
};

/** Re-reads the table and makes it the live list the public pages render. */
export const refreshInventory = async (): Promise<Car[]> => {
  const next = await fetchInventory();
  setInventory(next);
  return next;
};

/**
 * Inserts or updates one vehicle. `isNew` decides which, so a typo'd stock
 * number on an edit can't silently create a second car.
 */
export const saveVehicle = async (car: Car, isNew: boolean): Promise<void> => {
  const row = toRow(car);
  const query = isNew
    ? client().from("vehicles").insert(row)
    : client().from("vehicles").update(row).eq("id", row.id);

  const { error } = await query;
  if (error) {
    if (error.code === "23505") throw new Error(`Stock number ${row.id} is already in use.`);
    throw new Error(error.message);
  }
};

/** Quick edits from the list — status, published, featured. */
export const patchVehicle = async (
  id: string,
  patch: Partial<Pick<VehicleRow, "status" | "published" | "featured">>
): Promise<void> => {
  const { error } = await client().from("vehicles").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
};

/**
 * Deletes a vehicle and the photos we host for it. A car that's on an order
 * can't go — the foreign key refuses — so say what to do instead.
 */
export const deleteVehicle = async (car: Car): Promise<void> => {
  const { error, count } = await client()
    .from("vehicles")
    .delete({ count: "exact" })
    .eq("id", car.id);

  if (error) {
    if (error.code === "23503") {
      throw new Error("This car is on a customer's order. Mark it sold or hide it instead.");
    }
    throw new Error(error.message);
  }
  // RLS hides a refused delete as "0 rows" rather than an error.
  if (count === 0) throw new Error("Only an admin or super admin can delete stock.");

  const paths = car.images.map(storagePath).filter((path): path is string => Boolean(path));
  if (paths.length > 0) {
    // Best effort: a leftover photo costs a little storage, nothing more.
    await client().storage.from(BUCKET).remove(paths);
  }
};

/**
 * Suggests the next stock number after the highest NEO-#### in use, so the
 * team isn't left guessing. They can still type their own.
 */
export const nextStockNumber = (list: Car[]): string => {
  const highest = list.reduce((max, car) => {
    const match = /^NEO-(\d+)$/i.exec(car.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 1000);
  return `NEO-${highest + 1}`;
};

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

/** The object path inside our bucket, or null for a photo hosted elsewhere. */
const storagePath = (url: string): string | null => {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
};

const MAX_EDGE = 1600;

/**
 * Phone photos arrive at 4000px and several megabytes; nobody needs that on a
 * listing. Scales the long edge down to 1600px and re-encodes as JPEG. Falls
 * back to the original file if the browser can't decode it.
 */
const shrink = async (file: File): Promise<Blob> => {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    return blob ?? file;
  } catch {
    return file;
  }
};

/** Uploads one photo for a vehicle and returns its public URL. */
export const uploadVehiclePhoto = async (carId: string, file: File): Promise<string> => {
  const body = await shrink(file);
  const extension = body.type === "image/jpeg" ? "jpg" : (file.name.split(".").pop() ?? "jpg");
  const folder = carId.trim() || "unassigned";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await client()
    .storage.from(BUCKET)
    .upload(path, body, { contentType: body.type || file.type, upsert: false });

  if (error) throw new Error(error.message);

  return client().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};
