/**
 * Loads what the whole site renders from — the stock list, the make list and
 * the contact details — before React mounts, so every page can keep reading them
 * synchronously from src/data/cars.ts and src/config/site.ts.
 *
 * Nothing here is allowed to stop the site from opening. If Supabase isn't
 * configured, is unreachable, or the tables haven't been created yet, the
 * bundled defaults stay in place and the reason goes to the console.
 */
import { setInventory, setMakeCatalog } from "@/data/cars";
import { fetchInventory } from "@/lib/inventory";
import { fetchMakes } from "@/lib/makes";
import { applySiteSettings, fetchSiteSettings } from "@/lib/siteSettings";
import { isSupabaseConfigured } from "@/lib/supabase";

/** Long enough for a slow mobile connection, short enough not to feel broken. */
const TIMEOUT_MS = 6000;

const withTimeout = <T,>(promise: Promise<T>): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${TIMEOUT_MS}ms`)), TIMEOUT_MS)
    ),
  ]);

export const bootstrap = async (): Promise<void> => {
  if (!isSupabaseConfigured) return;

  const [inventory, makes, settings] = await Promise.allSettled([
    withTimeout(fetchInventory()),
    withTimeout(fetchMakes()),
    withTimeout(fetchSiteSettings()),
  ]);

  if (inventory.status === "fulfilled") {
    setInventory(inventory.value);
  } else {
    console.warn("[neo] Showing the bundled stock list:", inventory.reason);
  }

  if (makes.status === "fulfilled") {
    setMakeCatalog(makes.value);
  } else {
    console.warn("[neo] Naming makes from the stock list:", makes.reason);
  }

  if (settings.status === "fulfilled") {
    if (settings.value) applySiteSettings(settings.value);
  } else {
    console.warn("[neo] Using default contact details:", settings.reason);
  }
};
