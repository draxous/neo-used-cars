import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  siteConfig,
  countries,
  budgetRanges,
  yearRanges,
  phoneCountries,
} from "@/config/site";
import { useAuth } from "@/lib/auth";
import { saveQuoteRequest } from "@/lib/quotes";
import { useUserData } from "@/lib/userData";
import { cn } from "@/lib/utils";

const MESSAGE_LIMIT = 1000;

const inquirySchema = z.object({
  firstName: z.string().min(1, "Please enter your first name").max(80, "Too long"),
  lastName: z.string().min(1, "Please enter your last name").max(80, "Too long"),
  email: z.string().min(1, "Please enter your email").email("Please enter a valid email"),
  phoneCountry: z.string().min(1),
  phone: z.string().min(4, "Please enter your phone number").max(30, "Too long"),
  country: z.string().min(1, "Please select your country"),
  make: z.string().min(1, "Please enter a make").max(80, "Too long"),
  model: z.string().min(1, "Please enter a model").max(80, "Too long"),
  yearRange: z.string().min(1, "Please select a year range"),
  budget: z.string().min(1, "Please select a budget"),
  message: z.string().max(MESSAGE_LIMIT, "Message is too long").optional(),
});

type InquiryValues = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  /** "compact" tightens spacing and stacks paired fields for the hero card. */
  variant?: "compact" | "full";
  /** Pre-fills the vehicle, e.g. from a car detail page. */
  defaultMake?: string;
  defaultModel?: string;
  onSuccess?: () => void;
  className?: string;
}

/** Red asterisk marking a required field, as in the design. */
const Required = () => (
  <span className="text-destructive" aria-hidden="true">
    *
  </span>
);

const FieldError = ({ children }: { children?: string }) =>
  children ? <p className="text-xs text-destructive mt-1">{children}</p> : null;

/** Dial codes repeat across countries, so the name is what we store. */
const dialFor = (name: string) =>
  phoneCountries.find((country) => country.name === name)?.dial ?? "";

const subjectFor = (values: InquiryValues) =>
  `Website inquiry from ${values.firstName} ${values.lastName} — ${values.make} ${values.model}`;

const describe = (values: InquiryValues) =>
  [
    `Name: ${values.firstName} ${values.lastName}`,
    `Email: ${values.email}`,
    `Phone: ${dialFor(values.phoneCountry)} ${values.phone}`,
    `Country: ${values.country}`,
    `Vehicle: ${values.make} ${values.model}`,
    `Year range: ${values.yearRange}`,
    `Budget: ${values.budget}`,
    values.message ? `\n${values.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

/** Last resort: hand the visitor their own mail client rather than lose the request. */
const openMailClient = (values: InquiryValues) => {
  window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    subjectFor(values)
  )}&body=${encodeURIComponent(describe(values))}`;
};

/** Optional heads-up email. The request is already stored either way. */
const notifyByEmail = async (values: InquiryValues) => {
  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: siteConfig.web3formsKey,
      subject: subjectFor(values),
      from_name: `${siteConfig.name} Website`,
      name: `${values.firstName} ${values.lastName}`,
      email: values.email,
      phone: `${dialFor(values.phoneCountry)} ${values.phone}`,
      country: values.country,
      vehicle: `${values.make} ${values.model}`,
      year_range: values.yearRange,
      budget: values.budget,
      message: values.message || "No additional message",
    }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message ?? "Submission failed");
};

const InquiryForm = ({
  variant = "compact",
  defaultMake = "",
  defaultModel = "",
  onSuccess,
  className,
}: InquiryFormProps) => {
  const { user } = useAuth();
  const { logActivity } = useUserData();

  const emptyForm = {
    firstName: "",
    lastName: "",
    email: "",
    phoneCountry: phoneCountries[0].name,
    phone: "",
    country: "",
    make: defaultMake,
    model: defaultModel,
    yearRange: "",
    budget: "",
    message: "",
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: emptyForm,
  });

  const message = watch("message") ?? "";
  const phoneCountry = watch("phoneCountry");

  const onSubmit = async (values: InquiryValues) => {
    // The row is the record of the request; the email is a convenience on top.
    try {
      // Spelled out rather than passed whole: the project compiles with
      // strictNullChecks off, which makes zod infer every field as optional.
      await saveQuoteRequest(
        {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: `${dialFor(values.phoneCountry)} ${values.phone}`,
          country: values.country,
          make: values.make,
          model: values.model,
          yearRange: values.yearRange,
          budget: values.budget,
          message: values.message,
        },
        user?.id ?? null
      );
    } catch (error) {
      openMailClient(values);
      toast.info("Opening your email app", {
        description: "We couldn't reach our servers just now — this sends it to us directly.",
      });
      return;
    }

    // Never let a notification failure tell someone their request was lost.
    if (siteConfig.web3formsKey) {
      void notifyByEmail(values).catch(() => undefined);
    }

    toast.success("Inquiry sent!", {
      description: "Our team will get back to you within 24 hours.",
    });

    // Signed-in customers get the inquiry on their activity feed.
    if (user) {
      logActivity({
        type: "inquiry",
        title: "Inquiry sent",
        detail: `${values.make} ${values.model}`.trim() || "General inquiry",
        href: "/dashboard/activity",
      });
    }

    reset(emptyForm);
    onSuccess?.();
  };

  const gap = variant === "compact" ? "space-y-2.5" : "space-y-4";
  // Paired side by side at every width, as in the design — stacking them made
  // the form far too long in the hero card.
  const pair = variant === "compact" ? "grid grid-cols-2 gap-2.5" : "grid grid-cols-2 gap-4";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn(gap, className)} noValidate>
      <div className={pair}>
        <div>
          <Label htmlFor="inquiry-first-name" className="text-xs font-medium">
            First Name <Required />
          </Label>
          <Input
            id="inquiry-first-name"
            placeholder="John"
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            className="mt-1.5"
            {...register("firstName")}
          />
          <FieldError>{errors.firstName?.message}</FieldError>
        </div>

        <div>
          <Label htmlFor="inquiry-last-name" className="text-xs font-medium">
            Last Name <Required />
          </Label>
          <Input
            id="inquiry-last-name"
            placeholder="Doe"
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            className="mt-1.5"
            {...register("lastName")}
          />
          <FieldError>{errors.lastName?.message}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="inquiry-email" className="text-xs font-medium">
          Email <Required />
        </Label>
        <Input
          id="inquiry-email"
          type="email"
          placeholder="johndoe@example.com"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          className="mt-1.5"
          {...register("email")}
        />
        <FieldError>{errors.email?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="inquiry-phone" className="text-xs font-medium">
          Phone <Required />
        </Label>
        {/* Dial code and number read as a single control, as in the design. */}
        <div className="mt-1.5 flex">
          <Controller
            name="phoneCountry"
            control={control}
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger
                  aria-label="Country dial code"
                  className="w-[4.75rem] flex-shrink-0 rounded-r-none border-r-0 focus:z-10"
                >
                  {/* Flag alone on the trigger; the list carries the detail. */}
                  <SelectValue>
                    <span className="text-base leading-none">
                      {phoneCountries.find((country) => country.name === phoneCountry)?.flag}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {phoneCountries.map((country) => (
                    <SelectItem key={country.name} value={country.name}>
                      <span className="mr-2">{country.flag}</span>
                      {country.name} <span className="text-muted-foreground">{country.dial}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Input
            id="inquiry-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="Eg.3 1234 5678"
            aria-invalid={Boolean(errors.phone)}
            className="rounded-l-none"
            {...register("phone")}
          />
        </div>
        <FieldError>{errors.phone?.message}</FieldError>
      </div>

      <div>
        <Label className="text-xs font-medium">
          Country <Required />
        </Label>
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <SelectTrigger className="mt-1.5" aria-invalid={Boolean(errors.country)}>
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
        <FieldError>{errors.country?.message}</FieldError>
      </div>

      <div className={pair}>
        <div>
          <Label htmlFor="inquiry-make" className="text-xs font-medium">
            Make <Required />
          </Label>
          <Input
            id="inquiry-make"
            placeholder="Toyota"
            aria-invalid={Boolean(errors.make)}
            className="mt-1.5"
            {...register("make")}
          />
          <FieldError>{errors.make?.message}</FieldError>
        </div>

        <div>
          <Label htmlFor="inquiry-model" className="text-xs font-medium">
            Model <Required />
          </Label>
          <Input
            id="inquiry-model"
            placeholder="Supra"
            aria-invalid={Boolean(errors.model)}
            className="mt-1.5"
            {...register("model")}
          />
          <FieldError>{errors.model?.message}</FieldError>
        </div>
      </div>

      <div className={pair}>
        <div>
          <Label className="text-xs font-medium">
            Year Range <Required />
          </Label>
          <Controller
            name="yearRange"
            control={control}
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger className="mt-1.5" aria-invalid={Boolean(errors.yearRange)}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {yearRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError>{errors.yearRange?.message}</FieldError>
        </div>

        <div>
          <Label className="text-xs font-medium">
            Budget <Required />
          </Label>
          <Controller
            name="budget"
            control={control}
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger className="mt-1.5" aria-invalid={Boolean(errors.budget)}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError>{errors.budget?.message}</FieldError>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <Label htmlFor="inquiry-message" className="text-xs font-medium">
            Message <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {message.length}/{MESSAGE_LIMIT}
          </span>
        </div>
        <Textarea
          id="inquiry-message"
          rows={variant === "compact" ? 2 : 4}
          maxLength={MESSAGE_LIMIT}
          placeholder="Tell us more about your dream car…"
          aria-invalid={Boolean(errors.message)}
          className="mt-1.5 resize-none"
          {...register("message")}
        />
        <FieldError>{errors.message?.message}</FieldError>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 font-semibold",
          variant === "compact" ? "h-11" : "h-12 text-base"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Submit Inquiry
            <ArrowUpRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {variant === "full" && (
        <p className="text-[11px] text-muted-foreground text-center leading-snug">
          We reply within 24 hours. Your details are never shared.
        </p>
      )}
    </form>
  );
};

export default InquiryForm;
