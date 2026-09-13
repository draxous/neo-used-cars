import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { History, Search } from "lucide-react";
import ActivityItem from "@/components/ActivityItem";
import { Button } from "@/components/ui/button";
import { ActivityType, useUserData } from "@/lib/userData";
import { cn } from "@/lib/utils";

const filters: { value: string; label: string; types: ActivityType[] }[] = [
  { value: "all", label: "All", types: [] },
  { value: "shipping", label: "Orders & shipping", types: ["order", "shipping"] },
  { value: "favorites", label: "Favourites", types: ["favorite-added", "favorite-removed"] },
  { value: "inquiries", label: "Inquiries", types: ["inquiry"] },
];

/** "Today" / "Yesterday" / "12 Sep 2026" — the heading each event sits under. */
const dayLabel = (iso: string): string => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(date, today)) return "Today";
  if (same(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const Activity = () => {
  const { activity } = useUserData();
  const [filter, setFilter] = useState("all");

  const visible = useMemo(() => {
    const types = filters.find((entry) => entry.value === filter)?.types ?? [];
    const events = types.length
      ? activity.filter((event) => types.includes(event.type))
      : activity;
    return [...events].sort((a, b) => b.at.localeCompare(a.at));
  }, [activity, filter]);

  // Grouped by day, newest first, so the feed reads as a timeline.
  const groups = useMemo(() => {
    const map = new Map<string, typeof visible>();
    visible.forEach((event) => {
      const label = dayLabel(event.at);
      map.set(label, [...(map.get(label) ?? []), event]);
    });
    return [...map.entries()];
  }, [visible]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Your <span className="text-primary">activity</span>
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Everything that's happened on your account — saves, inquiries, orders and shipping
          updates.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((entry) => {
          const count = entry.types.length
            ? activity.filter((event) => entry.types.includes(event.type)).length
            : activity.length;
          return (
            <button
              key={entry.value}
              type="button"
              onClick={() => setFilter(entry.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filter === entry.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              )}
            >
              {entry.label}
              <span className="ml-1.5 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {groups.length > 0 ? (
        <div className="space-y-6">
          {groups.map(([label, events]) => (
            <section key={label}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {label}
              </h2>
              <ul className="bg-card rounded-lg card-shadow divide-y divide-border px-2">
                {events.map((event) => (
                  <ActivityItem key={event.id} event={event} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg card-shadow py-16 text-center">
          <History className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            {activity.length === 0 ? "No activity yet" : "Nothing in this filter"}
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {activity.length === 0
              ? "Save a vehicle or send an inquiry and it'll show up here."
              : "Try another filter to see the rest of your activity."}
          </p>
          {activity.length === 0 && (
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link to="/search">
                <Search className="h-4 w-4" />
                Browse stock
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Activity;
