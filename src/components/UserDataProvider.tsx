import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Car, carPath } from "@/data/cars";
import { useAuth } from "@/lib/auth";
import { listMyOrders } from "@/lib/orders";
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

/**
 * Each line on an order's timeline also belongs on the activity feed. Derived
 * on every load rather than stored, so a correction made by the team shows up
 * everywhere at once.
 */
const orderEvents = (purchases: Purchase[]): ActivityEvent[] =>
  purchases.flatMap((purchase) => {
    const name = purchase.carLabel ?? purchase.carId;
    return purchase.updates.map((update, index) => ({
      id: `${purchase.id}-${index}`,
      at: update.at,
      type: update.label.startsWith("Payment") ? ("order" as const) : ("shipping" as const),
      title: update.label,
      detail: `${name} · ${purchase.id}`,
      carId: purchase.carId || undefined,
      href: "/dashboard/vehicles",
    }));
  });

const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, ready } = useAuth();
  const [data, setData] = useState<UserData>(emptyUserData);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const email = user?.email ?? null;
  const userId = user?.id ?? null;

  // Load (and, for a new account, seed) whenever the signed-in user changes.
  useEffect(() => {
    if (!ready) return;
    if (!email) {
      setData(emptyUserData);
      return;
    }

    const stored = readUserData(email);
    const isNew = stored.activity.length === 0 && stored.favorites.length === 0;

    if (!isNew) {
      setData(stored);
      return;
    }

    const seeded: UserData = {
      favorites: [],
      activity: [
        {
          id: eventId(),
          at: user?.createdAt ?? new Date().toISOString(),
          type: "account",
          title: "Account created",
          detail: "Welcome to Neo",
          href: "/dashboard/home",
        },
      ],
    };
    writeUserData(email, seeded);
    setData(seeded);
  }, [email, ready, user?.createdAt]);

  // Orders live in the database, so they follow the account to any device.
  useEffect(() => {
    if (!ready || !userId) {
      setPurchases([]);
      return;
    }

    let cancelled = false;
    listMyOrders(userId)
      .then((orders) => {
        if (!cancelled) setPurchases(orders);
      })
      .catch(() => {
        // The dashboard still works without them; My Vehicles just reads empty.
        if (!cancelled) setPurchases([]);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, userId]);

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

  const activity = useMemo(
    () => [...data.activity, ...orderEvents(purchases)].sort((a, b) => b.at.localeCompare(a.at)),
    [data.activity, purchases]
  );

  const value = useMemo(
    () => ({ ...data, activity, purchases, isFavorite, toggleFavorite, logActivity }),
    [data, activity, purchases, isFavorite, toggleFavorite, logActivity]
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};

export default UserDataProvider;
