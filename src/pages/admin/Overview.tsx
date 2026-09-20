import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Car as CarIcon,
  ImageOff,
  Inbox,
  Loader2,
  MessagesSquare,
  Plus,
  Ship,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Car } from "@/data/cars";
import {
  AdminOrderMessage,
  AdminQuote,
  listCustomers,
  listOrderMessagesForAdmin,
  listQuotes,
} from "@/lib/admin";
import { useAuth } from "@/lib/auth";
import { AdminCarRequest, listCarRequestsForAdmin, requestLabels } from "@/lib/carRequests";
import { fetchInventory } from "@/lib/inventory";
import { AdminOrder, listOrdersForAdmin } from "@/lib/orders";
import { formatDate, shipmentStages, stageIndex, timeAgo } from "@/lib/userData";

interface Snapshot {
  quotes: AdminQuote[];
  messages: AdminOrderMessage[];
  orders: AdminOrder[];
  requests: AdminCarRequest[];
  cars: Car[];
  customerCount: number;
  newCustomers: number;
}

const DAY = 86_400_000;

/**
 * The first screen after signing in: what needs a reply, what's on the water,
 * and anything in the stock list that looks unfinished.
 */
const Overview = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Each part loads on its own so one missing table doesn't blank the page.
    Promise.allSettled([
      listQuotes(),
      listOrderMessagesForAdmin(),
      listOrdersForAdmin(),
      fetchInventory(),
      listCustomers(),
      listCarRequestsForAdmin(),
    ]).then(([quotes, messages, orders, cars, customers, requests]) => {
      const value = <T,>(result: PromiseSettledResult<T>, fallback: T) =>
        result.status === "fulfilled" ? result.value : fallback;

      if (
        [quotes, messages, orders, cars, customers, requests].some(
          (result) => result.status === "rejected"
        )
      ) {
        setError("Some figures couldn't load. If this is a new setup, run supabase/schema.sql.");
      }

      const people = value(customers, []);
      setData({
        quotes: value(quotes, []),
        messages: value(messages, []),
        orders: value(orders, []),
        requests: value(requests, []),
        cars: value(cars, []),
        customerCount: people.length,
        newCustomers: people.filter((person) => Date.now() - new Date(person.createdAt).getTime() < 30 * DAY)
          .length,
      });
    });
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  const newQuotes = data.quotes.filter((quote) => quote.status === "new");
  const newRequests = data.requests.filter((request) => request.status === "new");
  const newMessages = data.messages.filter((item) => item.status === "new" || item.status === "open");
  const inTransit = data.orders.filter((order) => order.stage !== "arrived");
  const listed = data.cars.filter((car) => car.published !== false && car.status !== "sold");
  const arrivingSoon = inTransit
    .filter((order) => order.etaDate && new Date(order.etaDate).getTime() - Date.now() < 14 * DAY)
    .sort((a, b) => (a.etaDate ?? "").localeCompare(b.etaDate ?? ""));
  const noPhotos = listed.filter((car) => car.images.length === 0);

  const stats = [
    { label: "New quote requests", value: newQuotes.length, icon: Inbox, href: "/admin/quotes", alert: newQuotes.length > 0 },
    { label: "Messages to answer", value: newMessages.length, icon: MessagesSquare, href: "/admin/messages", alert: newMessages.length > 0 },
    {
      label: "Buy & bid requests",
      value: newRequests.length,
      icon: ShoppingCart,
      href: "/admin/requests",
      alert: newRequests.length > 0,
    },
    { label: "Orders on the way", value: inTransit.length, icon: Ship, href: "/admin/orders" },
    { label: "Cars listed", value: listed.length, icon: CarIcon, href: "/admin/inventory" },
    {
      label: "Customer accounts",
      value: data.customerCount,
      icon: Users,
      href: "/admin/customers",
      note: data.newCustomers ? `${data.newCustomers} new this month` : undefined,
    },
  ];

  const inbox = [
    ...newQuotes.map((quote) => ({
      id: quote.id,
      at: quote.createdAt,
      title: `${quote.firstName} ${quote.lastName}`,
      detail: `Quote · ${quote.make} ${quote.model} · ${quote.budget}`,
      href: "/admin/quotes",
    })),
    ...newMessages.map((item) => ({
      id: item.id,
      at: item.createdAt,
      title: item.customerName || item.customerEmail,
      detail: `${item.topic} · ${item.orderId}`,
      href: "/admin/messages",
    })),
    ...newRequests.map((request) => ({
      id: request.id,
      at: request.createdAt,
      title: request.customerName || request.customerEmail,
      detail: `${requestLabels[request.kind]} · ${request.carLabel}`,
      href: "/admin/requests",
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Hello, <span className="text-primary">{user?.name.split(" ")[0] || "there"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what needs your attention.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/admin/orders?new=1">
              <Plus className="h-4 w-4" />
              New order
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/admin/inventory/new">
              <Plus className="h-4 w-4" />
              Add vehicle
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="group bg-card rounded-lg card-shadow hover:card-shadow-hover transition-all p-4"
          >
            <stat.icon className={stat.alert ? "h-5 w-5 text-accent" : "h-5 w-5 text-primary"} />
            <p className="font-display text-2xl font-bold text-foreground mt-2 tabular-nums">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            {stat.note && <p className="text-[11px] text-primary mt-0.5">{stat.note}</p>}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="bg-card rounded-lg card-shadow p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground">Waiting for a reply</h2>
            <Link to="/admin/quotes" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              Inbox <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {inbox.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-4">All caught up.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {inbox.map((item) => (
                <li key={item.id}>
                  <Link to={item.href} className="flex items-center justify-between gap-3 py-2.5 hover:text-primary">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium truncate">{item.title}</span>
                      <span className="block text-xs text-muted-foreground truncate">{item.detail}</span>
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(item.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-card rounded-lg card-shadow p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground">Arriving in the next two weeks</h2>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              Orders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {arrivingSoon.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-4">
              {inTransit.length === 0 ? "Nothing on the way." : "No ETAs in the next 14 days."}
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {arrivingSoon.slice(0, 6).map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium truncate">{order.carLabel}</span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {order.customerName || order.customerEmail} · {shipmentStages[stageIndex(order.stage)].label}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {order.etaDate && formatDate(order.etaDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {noPhotos.length > 0 && (
        <section className="bg-card rounded-lg card-shadow p-5">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <ImageOff className="h-4 w-4 text-accent" />
            Listed without photos
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            These are live on the site with a blank picture.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {noPhotos.map((car) => (
              <Button key={car.id} asChild variant="outline" size="sm">
                <Link to={`/admin/inventory/${car.id}`}>
                  <span className="font-mono text-xs mr-1.5">{car.id}</span>
                  {car.make} {car.model}
                </Link>
              </Button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Overview;
