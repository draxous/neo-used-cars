import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthError,
  EmailNotVerifiedError,
  describePath,
  safeRedirect,
  useAuth,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().min(1, "Enter your email address").email("That doesn't look like an email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});

type Values = z.infer<typeof schema>;

const Login = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const redirect = safeRedirect(params.get("redirect"));
  const registerHref = `/register?redirect=${encodeURIComponent(redirect)}`;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    // Errors appear as you leave a field, then correct themselves as you type.
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { email: params.get("email") ?? "", password: "", remember: true },
  });

  const onSubmit = async (values: Values) => {
    setFormError(null);
    try {
      const account = await signIn(values.email, values.password, values.remember);
      toast.success(`Welcome back, ${account.name.split(" ")[0]}.`);
      navigate(redirect, { replace: true });
    } catch (error) {
      // Right password, unconfirmed address: send them somewhere they can act
      // on it rather than leaving an error they can do nothing about.
      if (error instanceof EmailNotVerifiedError) {
        const query = new URLSearchParams({ email: error.email, redirect });
        navigate(`/verify-email?${query.toString()}`);
        return;
      }
      setFormError(
        error instanceof AuthError
          ? error.message
          : "Something went wrong signing you in. Please try again."
      );
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Pick up where you left off — your shortlist, inquiries and bids."
      footer={
        <>
          New to Neo?{" "}
          <Link to={registerHref} className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {/* Tell people where they'll end up, so the detour makes sense */}
      {params.get("redirect") && (
        <p className="mb-4 rounded-md bg-secondary px-3 py-2 text-xs text-secondary-foreground">
          Sign in to continue to <span className="font-medium">{describePath(redirect)}</span>.
        </p>
      )}

      {formError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            {formError}{" "}
            <Link to={registerHref} className="font-medium underline">
              Create one
            </Link>{" "}
            if you haven't registered yet.
          </span>
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

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to={`/forgot-password?email=${encodeURIComponent(watch("email") ?? "")}`}
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Your password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="mt-1.5"
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" className="text-xs text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer w-fit">
          <Checkbox
            checked={watch("remember")}
            onCheckedChange={(checked) => setValue("remember", checked === true)}
          />
          Keep me signed in on this device
        </label>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
