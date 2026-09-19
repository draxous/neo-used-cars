import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Reply, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InquiryReply, replyMailto } from "@/lib/admin";
import { formatDate } from "@/lib/userData";

const REPLY_LIMIT = 4000;

interface AdminReplyThreadProps {
  /** Unique per thread, so labels and inputs pair up on a long page. */
  id: string;
  replies: InquiryReply[];
  onSend: (body: string) => Promise<void>;
  /** Where the email copy goes, and what its subject line says. */
  email: string;
  subject: string;
  /**
   * Whether the customer will see the reply in their dashboard. Without an
   * account, email is the only way it reaches them, so it's ticked for you.
   */
  seenInDashboard: boolean;
}

/**
 * The replies already sent on a quote or message, and a box to send another.
 * Saving records the reply (and moves the status along in the database);
 * the email copy opens in the admin's own mail app, as the site has no mail
 * server of its own.
 */
const AdminReplyThread = ({
  id,
  replies,
  onSend,
  email,
  subject,
  seenInDashboard,
}: AdminReplyThreadProps) => {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [alsoEmail, setAlsoEmail] = useState(!seenInDashboard);
  const [sending, setSending] = useState(false);

  const send = async () => {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    try {
      await onSend(text);
      if (alsoEmail) window.location.href = replyMailto(email, subject, text);
      toast.success(
        seenInDashboard ? "Reply sent — it's on their dashboard" : "Reply saved",
        alsoEmail ? { description: "Your email app has the copy ready to send." } : undefined
      );
      setBody("");
      setOpen(false);
    } catch {
      toast.error("Couldn't save that reply. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {replies.map((reply) => (
        <div key={reply.id} className="rounded-md bg-primary/5 border-l-2 border-primary px-3 py-2">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-primary">{reply.authorName || "Team"}</span> replied ·{" "}
            {formatDate(reply.createdAt)}
          </p>
          <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap break-words">{reply.body}</p>
        </div>
      ))}

      {open ? (
        <div className="rounded-md border border-border p-3 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor={`reply-${id}`} className="text-xs font-medium">
              Your reply
            </Label>
            <span className="text-xs tabular-nums text-muted-foreground">
              {body.length}/{REPLY_LIMIT}
            </span>
          </div>
          <Textarea
            id={`reply-${id}`}
            rows={4}
            maxLength={REPLY_LIMIT}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="resize-y"
            autoFocus
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`reply-email-${id}`}
                checked={alsoEmail}
                onCheckedChange={(checked) => setAlsoEmail(checked === true)}
              />
              <Label htmlFor={`reply-email-${id}`} className="text-xs font-normal cursor-pointer">
                Also open it as an email to {email}
              </Label>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={sending}>
                Cancel
              </Button>
              <Button size="sm" className="gap-1.5" onClick={send} disabled={sending || !body.trim()}>
                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Send reply
              </Button>
            </div>
          </div>
          {!seenInDashboard && (
            <p className="text-[11px] text-muted-foreground">
              They don't have an account, so email is the only way this reaches them.
            </p>
          )}
        </div>
      ) : (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Reply className="h-3.5 w-3.5" />
          Reply
        </Button>
      )}
    </div>
  );
};

export default AdminReplyThread;
