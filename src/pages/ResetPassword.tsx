import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";
import PasswordStrength from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthError, safeRedirect, useAuth } from "@/lib/auth";
import { clearResetRedirect, peekResetRedirect } from "@/lib/supabase";
import { passwordSchema } from "@/lib/password";

const schema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, "Re-enter your password"),
  })
  .refine((values) => values.password === values.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type Values = z.infer<typeof schema>;

/** Supabase reports a dead link in the query string or the hash, depending on flow. */
const readLinkError = (): string | null => {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const code = query.get("error_code") ?? hash.get("error_code");
  const description = query.get("error_description") ?? hash.get("error_description");
  if (!code && !description) return null;
  if (code?.includes("expired") || description?.includes("expired")) {
    return "That reset link has expired. Request a fresh one and it'll work.";
  }
  return "That reset link is no longer valid. Request a fresh one below.";
};

/** True while the page still carries tokens the client is busy exchanging. */
const hasLinkTokens = () => {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return Boolean(query.get("code") || query.get("token_hash") || hash.get("access_token"));
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, ready, resetPassword } = useAuth();

  // Where to land afterwards. The query string wins when the page was reached
  // directly; otherwise it comes from what /forgot-password put aside before
  // sending the email. `safeRedirect` keeps this to same-site paths.
  const requested = params.get("redirect") ?? peekResetRedirect();
  const redirect = safeRedirect(requested);
  const forgotHref = requested
    ? `/forgot-password?redirect=${encodeURIComponent(redirect)}`
    : "/forgot-password";
  const linkError = useMemo(readLinkError, []);
  const [formError, setFormError] = useState<string | null>(null);

  // The link's tokens are traded for a session asynchronously, so don't call it
  // broken until that has had a chance to finish.
  const [graceOver, setGraceOver] = useState(() => !hasLinkTokens());
  useEffect(() => {
    if (graceOver) return;
    const timer = setTimeout(() => setGraceOver(true), 4000);
    return () => clearTimeout(timer);
  }, [graceOver]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { password: "", confirm: "" },
  });

  const password = watch("password");
  const confirm = watch("confirm");

  // The "don't match" error hangs off the confirm field, so editing the
  // password alone would otherwise leave a stale error sitting there.
  useEffect(() => {
    if (confirm) trigger("confirm");
  }, [password, confirm, trigger]);

  const onSubmit = async (values: Values) => {
    setFormError(null);
    try {
      await resetPassword(values.password);
      clearResetRedirect();
      toast.success("Password updated — you're signed in.");
      navigate(redirect, { replace: true });
    } catch (error) {
      setFormError(
        error instanceof AuthError
          ? error.message
          : "We couldn't update your password. Please try again."
      );
    }
  };

  const linkIsDead = Boolean(linkError) || (ready && !user && graceOver);

  if (linkIsDead) {
    return (
      <AuthLayout
        title="This link has expired"
        subtitle={linkError ?? "Reset links are single-use and last an hour."}
        footer={
          <>
            Remembered it?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </>
        }
      >
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link to={forgotHref}>Send me a new link</Link>
        </Button>
      </AuthLayout>
    );
  }

  if (!ready || !user) {
    return (
      <AuthLayout title="Checking your link" subtitle="One moment.">
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="sr-only">Loading</span>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={`Setting a new password for ${user.email}.`}
      footer={
        <>
          Changed your mind?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            autoFocus
            placeholder="Create a password"
            aria-invalid={Boolean(errors.password)}
            className="mt-1.5"
            {...register("password")}
          />
          <PasswordStrength value={password} />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirm">Confirm new password</Label>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={Boolean(errors.confirm)}
            className="mt-1.5"
            {...register("confirm")}
          />
          {errors.confirm && (
            <p className="text-xs text-destructive mt-1">{errors.confirm.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating…
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              Set new password
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
