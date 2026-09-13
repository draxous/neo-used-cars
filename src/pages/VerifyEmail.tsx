import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, MailCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { AuthError, describePath, safeRedirect, useAuth } from "@/lib/auth";

/** Supabase reports a dead link in the query string or the hash, depending on flow. */
const readLinkError = (): string | null => {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const code = query.get("error_code") ?? hash.get("error_code");
  const description = query.get("error_description") ?? hash.get("error_description");
  if (!code && !description) return null;
  if (code?.includes("expired") || description?.includes("expired")) {
    return "That confirmation link has expired — they're only good for 24 hours.";
  }
  return "That confirmation link is no longer valid.";
};

const RESEND_COOLDOWN = 60;

/**
 * Two jobs in one screen: the "check your inbox" wait after registering, and
 * the landing page the confirmation link comes back to.
 */
const VerifyEmail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, ready, resendVerification } = useAuth();

  const redirect = safeRedirect(params.get("redirect"));
  const linkError = useMemo(readLinkError, []);
  const email = user?.email ?? params.get("email") ?? "";

  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = useCallback(async () => {
    if (!email) return;
    setFormError(null);
    setSending(true);
    try {
      await resendVerification(email);
      toast.success(`Confirmation email sent to ${email}.`);
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      setFormError(
        error instanceof AuthError
          ? error.message
          : "We couldn't send that email. Please try again."
      );
    } finally {
      setSending(false);
    }
  }, [email, resendVerification]);

  const verified = Boolean(user?.emailVerified);

  if (!ready) {
    return (
      <AuthLayout title="Confirming your email" subtitle="One moment.">
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="sr-only">Loading</span>
        </div>
      </AuthLayout>
    );
  }

  // Arrived by following the link — the session proves the address is theirs.
  if (verified) {
    return (
      <AuthLayout
        title="You're all set"
        subtitle={`${user?.email} is confirmed. Your account is ready to use.`}
      >
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            You'll stay signed in on this device. Everything you save — shortlist,
            inquiries, auction bids — now follows your account.
          </p>
        </div>

        <Button
          onClick={() => navigate(redirect, { replace: true })}
          className="w-full mt-4 bg-primary hover:bg-primary/90"
        >
          Continue to {describePath(redirect)}
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={linkError ? "Link expired" : "Confirm your email"}
      subtitle={
        linkError ??
        (email
          ? `We've sent a confirmation link to ${email}. Click it and you're in.`
          : "We've sent you a confirmation link. Click it and you're in.")
      }
      footer={
        <>
          Wrong address?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register again
          </Link>{" "}
          or{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            sign in
          </Link>
          .
        </>
      }
    >
      {formError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="rounded-md border border-border bg-secondary/50 p-4">
        <MailCheck className="h-6 w-6 text-primary" />
        <p className="mt-3 text-sm text-foreground">
          Your account isn't active until the address is confirmed — it's how we reach
          you about inquiries, invoices and shipping.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Nothing after a few minutes? Check your spam folder, then send it again.
        </p>
      </div>

      <Button
        onClick={resend}
        disabled={sending || cooldown > 0 || !email}
        variant="outline"
        className="w-full mt-4 gap-2"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : cooldown > 0 ? (
          `Send again in ${cooldown}s`
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Resend confirmation email
          </>
        )}
      </Button>

      {!email && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Open the link from the email we sent, or{" "}
          <Link to="/login" className="text-primary hover:underline">
            sign in
          </Link>{" "}
          to have it sent again.
        </p>
      )}
    </AuthLayout>
  );
};

export default VerifyEmail;
