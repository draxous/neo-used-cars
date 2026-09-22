import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Loader2, MailCheck, Send } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthError, useAuth } from "@/lib/auth";

const schema = z.object({
  email: z.string().min(1, "Enter your email address").email("That doesn't look like an email"),
});

type Values = z.infer<typeof schema>;

const ForgotPassword = () => {
  const [params] = useSearchParams();
  const { requestPasswordReset } = useAuth();
  // Where the person was headed before they got stuck on their password —
  // an invitation link, most often, which is unreachable without its token.
  const redirect = params.get("redirect");
  const backToSignIn = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : "/login";
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { email: params.get("email") ?? "" },
  });

  const onSubmit = async (values: Values) => {
    setFormError(null);
    try {
      await requestPasswordReset(values.email, redirect);
      // Shown even for an address we've never seen, so nobody can use this
      // form to find out which emails have accounts.
      setSentTo(values.email.trim());
    } catch (error) {
      setFormError(
        error instanceof AuthError
          ? error.message
          : "We couldn't send that email. Please try again."
      );
    }
  };

  if (sentTo) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`If ${sentTo} has an account, we've sent a link to reset its password.`}
        footer={
          <>
            Remembered it?{" "}
            <Link to={backToSignIn} className="font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </>
        }
      >
        <div className="rounded-md border border-border bg-secondary/50 p-4">
          <MailCheck className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm text-foreground">
            The link is good for one hour and can only be used once.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing after a few minutes? Check your spam folder, then{" "}
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="font-medium text-primary hover:underline"
            >
              try another address
            </button>
            .
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the address you registered with and we'll email you a link to set a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link to={backToSignIn} className="font-medium text-primary hover:underline">
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
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="mt-1.5"
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive mt-1">
              {errors.email.message}
            </p>
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
              Sending link…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Email me a reset link
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
