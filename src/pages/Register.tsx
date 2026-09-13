import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";
import PasswordStrength from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/config/site";
import { AuthError, describePath, safeRedirect, useAuth } from "@/lib/auth";
import { passwordSchema } from "@/lib/password";

const schema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().min(1, "Enter your email address").email("That doesn't look like an email"),
    country: z.string().min(1, "Select your destination country"),
    phone: z.string().optional(),
    company: z.string().optional(),
    password: passwordSchema,
    confirm: z.string().min(1, "Re-enter your password"),
    terms: z.boolean().refine((value) => value, "Please accept the terms to continue"),
  })
  .refine((values) => values.password === values.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type Values = z.infer<typeof schema>;

const Register = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { register: createAccount } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const redirect = safeRedirect(params.get("redirect"));
  const loginHref = `/login?redirect=${encodeURIComponent(redirect)}`;

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      country: "",
      phone: "",
      company: "",
      password: "",
      confirm: "",
      terms: false,
    },
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
      const result = await createAccount({
        name: values.name.trim(),
        email: values.email,
        password: values.password,
        country: values.country,
        phone: values.phone?.trim() || undefined,
        company: values.company?.trim() || undefined,
      });

      // The account exists but stays inert until the address is confirmed, so
      // the next stop is the inbox rather than the dashboard.
      if (!result.signedIn) {
        const query = new URLSearchParams({ email: result.email, redirect });
        navigate(`/verify-email?${query.toString()}`, { replace: true });
        return;
      }

      toast.success(`Account created — welcome, ${values.name.trim().split(" ")[0]}.`);
      navigate(redirect, { replace: true });
    } catch (error) {
      setFormError(
        error instanceof AuthError
          ? error.message
          : "Something went wrong creating your account. Please try again."
      );
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Takes a minute. We'll email you a link to confirm your address, then your shortlist and inquiries stay together."
      footer={
        <>
          Already registered?{" "}
          <Link to={loginHref} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {params.get("redirect") && (
        <p className="mb-4 rounded-md bg-secondary px-3 py-2 text-xs text-secondary-foreground">
          You'll continue to <span className="font-medium">{describePath(redirect)}</span> once
          you've confirmed your email.
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
            {formError.includes("already") && (
              <Link to={loginHref} className="font-medium underline">
                Sign in
              </Link>
            )}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            autoFocus
            placeholder="Your full name"
            aria-invalid={Boolean(errors.name)}
            className="mt-1.5"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            className="mt-1.5"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Destination country</Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="country" className="mt-1.5" aria-invalid={Boolean(errors.country)}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.country && (
              <p className="text-xs text-destructive mt-1">{errors.country.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">
              Phone <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+000 000 0000"
              className="mt-1.5"
              {...register("phone")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="company">
            Company <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="company"
            autoComplete="organization"
            placeholder="If you're buying for a dealership"
            className="mt-1.5"
            {...register("company")}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
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
          <Label htmlFor="confirm">Confirm password</Label>
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

        <div>
          <label className="flex items-start gap-2.5 text-sm text-foreground cursor-pointer">
            <Controller
              name="terms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="mt-0.5"
                />
              )}
            />
            <span>
              I agree to the{" "}
              <Link to="/faq" className="text-primary hover:underline">
                terms of business
              </Link>{" "}
              and to being contacted about my inquiries.
            </span>
          </label>
          {errors.terms && <p className="text-xs text-destructive mt-1">{errors.terms.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create account
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          We never share your details. Ever.
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
