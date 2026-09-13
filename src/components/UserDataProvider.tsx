import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Car, carPath, getCarById } from "@/data/cars";
import { useAuth } from "@/lib/auth";
import {
  ActivityEvent,
  Purchase,
  UserData,
  UserDataContext,
  emptyUserData,
  readUserData,
  writeUserData,
} from "@/lib/userData";

const eventId = () => `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const daysAhead = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

/**
 * DEMO SEED — gives a brand-new account something to look at on Activity and
 * My Vehicles before there's an orders API. Delete this function (and the call
 * in `load`) the moment real orders arrive; nothing else depends on it.
 */
const seedDemoData = (destination: string): UserData => {
  const purchases: Purchase[] = [
    {
      id: "NEO-ORD-2291",
      carId: "NEO-1042",
      purchasedAt: daysAgo(24),
      pricePaidUsd: 28500,
      stage: "shipped",
      destination,
      vessel: "Morning Cindy V.214",
      etaDate: daysAhead(12),
      updates: [
        { at: daysAgo(3), label: "Departed Yokohama" },
        { at: daysAgo(8), label: "Booked on Morning Cindy V.214" },
        { at: daysAgo(17), label: "Pre-export inspection passed" },
        { at: daysAgo(24), label: "Payment received — unit secured" },
      ],
    },
    {
      id: "NEO-ORD-2314",
      carId: "NEO-1051",
      purchasedAt: daysAgo(6),
      pricePaidUsd: 7200,
      stage: "inspected",
      destination,
      updates: [
        { at: daysAgo(2), label: "Pre-export inspection passed" },
        { at: daysAgo(6), label: "Payment received — unit secured" },
      ],
    },
  ];

  const activity: ActivityEvent[] = purchases.flatMap((purchase) => {
    const car = getCarById(purchase.carId);
    const name = car ? `${car.year} ${car.make} ${car.model}` : purchase.carId;
    return purchase.updates.map((update) => ({
      id: eventId(),
      at: update.at,
      type: update.label.startsWith("Payment") ? ("order" as const) : ("shipping" as const),
      title: update.label,
      detail: `${name} · ${purchase.id}`,
      carId: purchase.carId,
      href: "/dashboard/vehicles",
    }));
  });

  return { favorites: [], activity, purchases };
};

const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, ready } = useAuth();
  const [data, setData] = useState<UserData>(emptyUserData);

  const email = user?.email ?? null;

  // Load (and, for a new account, seed) whenever the signed-in user changes.
  useEffect(() => {
    if (!ready) return;
    if (!email) {
      setData(emptyUserData);
      return;
    }

    const stored = readUserData(email);
    const isNew =
      stored.activity.length === 0 &&
      stored.purchases.length === 0 &&
      stored.favorites.length === 0;

    if (!isNew) {
      setData(stored);
      return;
    }

    const seeded = seedDemoData(user?.country ?? "your port");
    seeded.activity.push({
      id: eventId(),
      at: user?.createdAt ?? new Date().toISOString(),
      type: "account",
      title: "Account created",
      detail: "Welcome to Neo",
      href: "/dashboard/home",
    });
    writeUserData(email, seeded);
    setData(seeded);
  }, [email, ready, user?.country, user?.createdAt]);

  const update = useCallback(
    (next: UserData) => {
      setData(next);
      if (email) writeUserData(email, next);
    },
    [email]
  );

  const logActivity = useCallback(
    (event: Omit<ActivityEvent, "id" | "at">) => {
      if (!email) return;
      const current = readUserData(email);
      const next: UserData = {
        ...current,
        activity: [{ ...event, id: eventId(), at: new Date().toISOString() }, ...current.activity],
      };
      update(next);
    },
    [email, update]
  );

  const toggleFavorite = useCallback(
    (car: Car) => {
      if (!email) return;
      const current = readUserData(email);
      const saved = current.favorites.includes(car.id);
      const favorites = saved
        ? current.favorites.filter((id) => id !== car.id)
        : [car.id, ...current.favorites];

      const event: ActivityEvent = {
        id: eventId(),
        at: new Date().toISOString(),
        type: saved ? "favorite-removed" : "favorite-added",
        title: saved ? "Removed from favourites" : "Saved to favourites",
        detail: `${car.year} ${car.make} ${car.model} · ${car.id}`,
        carId: car.id,
        href: carPath(car),
      };

      update({ ...current, favorites, activity: [event, ...current.activity] });
    },
    [email, update]
  );

  const isFavorite = useCallback(
    (carId: string) => data.favorites.includes(carId),
    [data.favorites]
  );

  const value = useMemo(
    () => ({ ...data, isFavorite, toggleFavorite, logActivity }),
    [data, isFavorite, toggleFavorite, logActivity]
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};

export default UserDataProvider;
