/**
 * Per-account data: favourites, activity feed and vehicle orders.
 *
 * DEMO ONLY, like `auth.ts` — everything lives in this browser, keyed by the
 * signed-in email. When the API lands, keep these shapes and swap the storage
 * functions for requests; the provider is the only place that touches storage.
 */
import { createContext, useContext } from "react";
import { Car } from "@/data/cars";

export type ActivityType =
  | "account"
  | "favorite-added"
  | "favorite-removed"
  | "inquiry"
  | "order"
  | "shipping";

export interface ActivityEvent {
  id: string;
  /** ISO timestamp. */
  at: string;
  type: ActivityType;
  title: string;
  detail?: string;
  /** Stock number, when the event is about one vehicle. */
  carId?: string;
  /** Where clicking the entry should go. */
  href?: string;
}

export type ShipmentStage = "purchased" | "inspected" | "booked" | "shipped" | "arrived";

/** Ordered pipeline shown as a tracker on My Vehicles. */
export const shipmentStages: { value: ShipmentStage; label: string; description: string }[] = [
  { value: "purchased", label: "Purchased", description: "Payment received and unit secured" },
  { value: "inspected", label: "Inspected", description: "Pre-export inspection and de-registration" },
  { value: "booked", label: "Booked", description: "Space booked on a vessel" },
  { value: "shipped", label: "Shipped", description: "On the water" },
  { value: "arrived", label: "Arrived", description: "Landed at your port" },
];

export interface Purchase {
  /** Order reference, e.g. "NEO-ORD-2291". */
  id: string;
  carId: string;
  purchasedAt: string;
  pricePaidUsd: number;
  stage: ShipmentStage;
  /** Where it's headed — the customer's country or port — plus vessel and ETA. */
  destination: string;
  vessel?: string;
  etaDate?: string;
  /** Newest first. */
  updates: { at: string; label: string }[];
}

export interface UserData {
  /** Stock numbers, newest first. */
  favorites: string[];
  activity: ActivityEvent[];
  purchases: Purchase[];
}

export const emptyUserData: UserData = { favorites: [], activity: [], purchases: [] };

export interface UserDataContextValue extends UserData {
  isFavorite: (carId: string) => boolean;
  toggleFavorite: (car: Car) => void;
  /** Records an event on the activity feed. */
  logActivity: (event: Omit<ActivityEvent, "id" | "at">) => void;
}

export const UserDataContext = createContext<UserDataContextValue | null>(null);

export const useUserData = (): UserDataContextValue => {
  const context = useContext(UserDataContext);
  if (!context) throw new Error("useUserData must be used inside <UserDataProvider>");
  return context;
};

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

const key = (email: string) => `neo.user.${email.toLowerCase()}.data`;

export const readUserData = (email: string): UserData => {
  try {
    const raw = localStorage.getItem(key(email));
    if (!raw) return emptyUserData;
    const parsed = JSON.parse(raw) as Partial<UserData>;
    return {
      favorites: parsed.favorites ?? [],
      activity: parsed.activity ?? [],
      purchases: parsed.purchases ?? [],
    };
  } catch {
    return emptyUserData;
  }
};

export const writeUserData = (email: string, data: UserData) => {
  try {
    localStorage.setItem(key(email), JSON.stringify(data));
  } catch {
    /* Storage unavailable — the session still works, it just won't persist. */
  }
};

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

/** "2 hours ago", "Yesterday", "12 Sep" — activity feeds read better relative. */
export const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  const minutes = Math.round((Date.now() - then) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const stageIndex = (stage: ShipmentStage): number =>
  shipmentStages.findIndex((entry) => entry.value === stage);
