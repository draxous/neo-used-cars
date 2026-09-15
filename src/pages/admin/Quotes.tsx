import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Inbox, Loader2, Mail, Phone, Search } from "lucide-react";
import AdminStatusSelect from "@/components/AdminStatusSelect";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminQuote, listQuotes, quoteStatuses, setQuoteStatus } from "@/lib/admin";
import { formatDate } from "@/lib/userData";

const Quotes = () => {
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQuotes(await listQuotes());
    } catch {
      setError("Couldn't load quote requests. Check the database connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotes.filter((quote) => {
      if (statusFilter !== "all" && quote.status !== statusFilter) return false;
      if (!term) return true;
      return [
        quote.firstName,
        quote.lastName,
        quote.email,
        quote.phone,
        quote.country,
        quote.make,
        quote.model,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [quotes, search, statusFilter]);

  const newCount = quotes.filter((quote) => quote.status === "new").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Quote <span className="text-primary">requests</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Loading…"
              : `${quotes.length} in total${newCount > 0 ? ` · ${newCount} new` : ""}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, email, vehicle…"
              className="pl-8 w-56 h-9"
              aria-label="Search quote requests"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[8.5rem] capitalize" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {quoteStatuses.map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Inbox className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            {quotes.length === 0 ? "No quote requests yet" : "Nothing matches that"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {quotes.length === 0
              ? "They'll appear here as soon as someone submits the form."
              : "Try a different search or status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((quote) => (
            <article key={quote.id} className="bg-card rounded-lg card-shadow p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display font-semibold text-foreground">
                    {quote.firstName} {quote.lastName}
                    {quote.userId && (
                      <Badge variant="secondary" className="ml-2 font-normal text-[11px]">
                        Account holder
                      </Badge>
                    )}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <a
                      href={`mailto:${quote.email}`}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {quote.email}
                    </a>
                    <a
                      href={`tel:${quote.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {quote.phone}
                    </a>
                    <span>{quote.country}</span>
                    <span>{formatDate(quote.createdAt)}</span>
                  </div>
                </div>

                <AdminStatusSelect
                  value={quote.status}
                  options={quoteStatuses}
                  onChange={(status) => setQuoteStatus(quote.id, status)}
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="font-normal">
                  {quote.make} {quote.model}
                </Badge>
                <Badge variant="secondary" className="font-normal">
                  {quote.yearRange}
                </Badge>
                <Badge variant="secondary" className="font-normal">
                  {quote.budget}
                </Badge>
              </div>

              {quote.message && (
                <p className="text-sm text-foreground mt-3 whitespace-pre-wrap break-words border-l-2 border-border pl-3">
                  {quote.message}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quotes;
