import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Loader2, Mail, Phone, Plus, Search, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminCustomer, listCustomers } from "@/lib/admin";
import { roleLabel } from "@/lib/adminInvites";
import { formatDate, timeAgo } from "@/lib/userData";

/** Everyone with an account: who they are, and what they've done with us. */
const Customers = () => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCustomers(await listCustomers());
    } catch {
      setError("Couldn't load customers. Has supabase/schema.sql been run?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) =>
      `${customer.name} ${customer.email} ${customer.country} ${customer.phone ?? ""} ${customer.company ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [customers, search]);

  const buyers = customers.filter((customer) => customer.orderCount > 0).length;
  const unverified = customers.filter((customer) => !customer.emailVerified).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            <span className="text-primary">Customers</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Loading…"
              : `${customers.length} accounts · ${buyers} have bought` +
                (unverified ? ` · ${unverified} haven't confirmed their email` : "")}
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email, country…"
            className="pl-8 w-64 h-9"
            aria-label="Search customers"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="sr-only">Loading</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-card rounded-lg card-shadow py-16 text-center">
          <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            {customers.length === 0 ? "No accounts yet" : "Nothing matches that"}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-lg card-shadow divide-y divide-border">
          {visible.map((customer) => (
            <div key={customer.userId} className="flex flex-wrap items-center gap-x-5 gap-y-2 p-4">
              <div className="min-w-0 flex-1 basis-64">
                <p className="font-medium text-sm text-foreground flex flex-wrap items-center gap-2">
                  {customer.name || "No name given"}
                  {customer.teamRole && (
                    <Badge variant="secondary" className="gap-1 font-normal text-[11px]">
                      <ShieldCheck className="h-3 w-3" />
                      {roleLabel(customer.teamRole)}
                    </Badge>
                  )}
                  {!customer.emailVerified && (
                    <Badge variant="outline" className="font-normal text-[11px]">
                      Email not confirmed
                    </Badge>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  <a href={`mailto:${customer.email}`} className="inline-flex items-center gap-1 hover:text-primary">
                    <Mail className="h-3.5 w-3.5" />
                    {customer.email}
                  </a>
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {customer.phone}
                    </a>
                  )}
                  {customer.country && <span>{customer.country}</span>}
                  {customer.company && <span>{customer.company}</span>}
                </div>
              </div>

              <div className="text-xs text-muted-foreground w-36">
                <p>Joined {formatDate(customer.createdAt)}</p>
                <p>{customer.lastSignIn ? `Last seen ${timeAgo(customer.lastSignIn).toLowerCase()}` : "Never signed in"}</p>
              </div>

              <div className="flex gap-2 text-xs">
                <Badge variant={customer.orderCount ? "default" : "secondary"} className="font-normal">
                  {customer.orderCount} order{customer.orderCount === 1 ? "" : "s"}
                </Badge>
                <Badge variant="secondary" className="font-normal">
                  {customer.quoteCount} quote{customer.quoteCount === 1 ? "" : "s"}
                </Badge>
              </div>

              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link to={`/admin/orders?new=1&customer=${customer.userId}`}>
                  <Plus className="h-3.5 w-3.5" />
                  Create order
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;
