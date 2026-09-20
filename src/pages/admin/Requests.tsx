import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertCircle,
  FileSearch,
  Gavel,
  Languages,
  Loader2,
  Mail,
  MessageSquareQuote,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import AdminStatusSelect from "@/components/AdminStatusSelect";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/data/cars";
import { useIsAdmin } from "@/lib/admin";
import {
  AdminCarRequest,
  RequestKind,
  deleteCarRequest,
  listCarRequestsForAdmin,
  requestLabels,
  requestStatuses,
  setCarRequestStatus,
} from "@/lib/carRequests";
import { formatDate } from "@/lib/userData";

const kindIcon: Record<RequestKind, typeof ShoppingCart> = {
  buy: ShoppingCart,
  bid: Gavel,
  translation: Languages,
  inspection: FileSearch,
  inquiry: MessageSquareQuote,
};

/**
 * Buy, bid and service requests from vehicle pages. A "buy it now" is the one
 * to act on first: agree payment, then create the order from the link here.
 */
const Requests = () => {
  const { isManager } = useIsAdmin();
  const [requests, setRequests] = useState<AdminCarRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const [deleting, setDeleting] = useState<AdminCarRequest | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRequests(await listCarRequestsForAdmin());
    } catch {
      setError("Couldn't load requests. Has supabase/schema.sql been run?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((request) => {
      // "open" is the default view: everything not yet finished.
      if (statusFilter === "open" && (request.status === "done" || request.status === "closed")) {
        return false;
      }
      if (statusFilter !== "open" && statusFilter !== "all" && request.status !== statusFilter) {
        return false;
      }
      if (kindFilter !== "all" && request.kind !== kindFilter) return false;
      if (!term) return true;
      return `${request.customerName} ${request.customerEmail} ${request.carLabel} ${request.carId ?? ""} ${request.message ?? ""}`
        .toLowerCase()
        .includes(term);
    });
  }, [requests, search, kindFilter, statusFilter]);

  const waiting = requests.filter((request) => request.status === "new").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Buy &amp; bid <span className="text-primary">requests</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading…" : `${requests.length} in total${waiting ? ` · ${waiting} new` : ""}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Customer, vehicle…"
              className="pl-8 w-52 h-9"
              aria-label="Search requests"
            />
          </div>
          <Select value={kindFilter} onValueChange={setKindFilter}>
            <SelectTrigger className="h-9 w-[8.5rem]" aria-label="Filter by type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(requestLabels).map(([kind, label]) => (
                <SelectItem key={kind} value={kind}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[8.5rem] capitalize" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Still open</SelectItem>
              <SelectItem value="all">All statuses</SelectItem>
              {requestStatuses.map((status) => (
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
          <ShoppingCart className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            {requests.length === 0 ? "No requests yet" : "Nothing matches that"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {requests.length === 0
              ? "Buy it now, bids and service requests from vehicle pages land here."
              : "Try a different search, type or status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((request) => {
            const Icon = kindIcon[request.kind];
            return (
              <article key={request.id} className="bg-card rounded-lg card-shadow p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display font-semibold text-foreground flex flex-wrap items-center gap-2">
                      <Badge className="gap-1 font-normal">
                        <Icon className="h-3 w-3" />
                        {requestLabels[request.kind]}
                      </Badge>
                      {request.customerName || "Customer"}
                      <span className="font-sans font-normal text-sm text-muted-foreground">
                        wants {request.carLabel}
                      </span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <a
                        href={`mailto:${request.customerEmail}`}
                        className="inline-flex items-center gap-1 hover:text-primary"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {request.customerEmail}
                      </a>
                      {request.carId && <span className="font-mono">{request.carId}</span>}
                      <span>{formatDate(request.createdAt)}</span>
                      {request.maxBidUsd !== null && (
                        <span className="text-foreground font-medium">
                          Max bid {formatPrice(request.maxBidUsd)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <AdminStatusSelect
                      key={request.status}
                      value={request.status}
                      options={requestStatuses}
                      onChange={(status) => setCarRequestStatus(request.id, status)}
                    />
                    {isManager && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleting(request)}
                        aria-label="Delete request"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {request.message && (
                  <p className="text-sm text-foreground mt-3 whitespace-pre-wrap break-words border-l-2 border-border pl-3">
                    {request.message}
                  </p>
                )}

                {request.kind === "buy" && (
                  <Button asChild variant="outline" size="sm" className="gap-1.5 mt-3">
                    <Link to={`/admin/orders?new=1&customer=${request.userId}`}>
                      <Plus className="h-3.5 w-3.5" />
                      Create the order
                    </Link>
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this request?"
        description={
          deleting && (
            <>
              {deleting.customerName || "The customer"}'s {requestLabels[deleting.kind].toLowerCase()}{" "}
              request for {deleting.carLabel} will be removed for good, including from their view of
              the car. To file it away instead, set the status to closed.
            </>
          )
        }
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteCarRequest(deleting.id);
            setRequests((current) => current.filter((item) => item.id !== deleting.id));
            toast.success("Request deleted");
          } catch (issue) {
            toast.error(issue instanceof Error ? issue.message : "Couldn't delete that request");
            throw issue;
          }
        }}
      />
    </div>
  );
};

export default Requests;
