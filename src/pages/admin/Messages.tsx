import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Loader2, Mail, MessagesSquare, Search, Trash2 } from "lucide-react";
import AdminReplyThread from "@/components/AdminReplyThread";
import AdminStatusSelect from "@/components/AdminStatusSelect";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminOrderMessage,
  InquiryReply,
  deleteOrderMessage,
  groupReplies,
  listOrderMessagesForAdmin,
  listReplies,
  messageStatuses,
  sendReply,
  setMessageStatus,
  useIsAdmin,
} from "@/lib/admin";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/userData";

const Messages = () => {
  const { user } = useAuth();
  const { isManager } = useIsAdmin();
  const [messages, setMessages] = useState<AdminOrderMessage[]>([]);
  const [replies, setReplies] = useState<Map<string, InquiryReply[]>>(new Map());
  const [deleting, setDeleting] = useState<AdminOrderMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const [nextMessages, nextReplies] = await Promise.all([
        listOrderMessagesForAdmin(),
        listReplies(),
      ]);
      setMessages(nextMessages);
      setReplies(groupReplies(nextReplies));
    } catch {
      setError("Couldn't load order messages. Check the database connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return messages.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!term) return true;
      return [
        item.customerName,
        item.customerEmail,
        item.orderId,
        item.carId ?? "",
        item.carLabel ?? "",
        item.topic,
        item.message,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [messages, search, statusFilter]);

  const newCount = messages.filter((item) => item.status === "new").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Order <span className="text-primary">messages</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Loading…"
              : `${messages.length} in total${newCount > 0 ? ` · ${newCount} new` : ""}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Customer, order, vehicle…"
              className="pl-8 w-56 h-9"
              aria-label="Search order messages"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[8.5rem] capitalize" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {messageStatuses.map((status) => (
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
          <MessagesSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            {messages.length === 0 ? "No messages yet" : "Nothing matches that"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {messages.length === 0
              ? "Questions customers send from My Vehicles arrive here."
              : "Try a different search or status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <article key={item.id} className="bg-card rounded-lg card-shadow p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display font-semibold text-foreground">
                    {item.customerName || "Customer"}
                    <span className="ml-2 font-sans font-normal text-sm text-muted-foreground">
                      asked about {item.carLabel ?? item.carId ?? "an order"}
                    </span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <a
                      href={`mailto:${item.customerEmail}`}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {item.customerEmail}
                    </a>
                    <span className="font-mono">{item.orderId}</span>
                    {item.carId && <span className="font-mono">{item.carId}</span>}
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <AdminStatusSelect
                    key={item.status}
                    value={item.status}
                    options={messageStatuses}
                    onChange={(status) => setMessageStatus(item.id, status)}
                  />
                  {isManager && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleting(item)}
                      aria-label="Delete message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <Badge variant="secondary" className="font-normal mt-3">
                {item.topic}
              </Badge>

              <p className="text-sm text-foreground mt-2 whitespace-pre-wrap break-words border-l-2 border-border pl-3">
                {item.message}
              </p>

              <AdminReplyThread
                id={item.id}
                replies={replies.get(item.id) ?? []}
                email={item.customerEmail}
                subject={`Re: ${item.topic} — order ${item.orderId}`}
                seenInDashboard
                onSend={async (body) => {
                  if (!user) throw new Error("Not signed in");
                  await sendReply({ messageId: item.id }, body, user.id);
                  void load(true);
                }}
              />
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this message?"
        description={
          deleting && (
            <>
              {deleting.customerName || "The customer"}'s message about {deleting.orderId} and any
              replies to it will be removed for good, including from their dashboard.
            </>
          )
        }
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteOrderMessage(deleting.id);
            setMessages((current) => current.filter((item) => item.id !== deleting.id));
            toast.success("Message deleted");
          } catch (issue) {
            toast.error(issue instanceof Error ? issue.message : "Couldn't delete that message");
            throw issue;
          }
        }}
      />
    </div>
  );
};

export default Messages;
