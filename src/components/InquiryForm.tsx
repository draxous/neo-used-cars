import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
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
import { siteConfig, countries, budgetRanges } from "@/config/site";
import { useAuth } from "@/lib/auth";
import { saveQuoteRequest } from "@/lib/quotes";
import { useUserData } from "@/lib/userData";
import { cn } from "@/lib/utils";

const inquirySchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  country: z.string().min(1, "Please select your country"),
  vehicle: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().max(1000, "Message is too long").optional(),
});

type InquiryValues = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  /** "compact" drops the message field — used in the hero card. */
  variant?: "compact" | "full";
  /** Pre-fills the vehicle field, e.g. from a car detail page. */
  defaultVehicle?: string;
  onSuccess?: () => void;
  className?: string;
}

const FieldError = ({ children }: { children?: string }) =>
  children ? <p className="text-xs text-destructive mt-1">{children}</p> : null;

const subjectFor = (values: InquiryValues) =>
  `Website inquiry from ${values.name}${values.vehicle ? ` — ${values.vehicle}` : ""}`;

/** Last resort: hand the visitor their own mail client rather than lose the request. */
const openMailClient = (values: InquiryValues) => {
  const body = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Country: ${values.country}`,
    values.vehicle ? `Vehicle of interest: ${values.vehicle}` : "",
    values.budget ? `Budget: ${values.budget}` : "",
    values.message ? `\n${values.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    subjectFor(values)
  )}&body=${encodeURIComponent(body)}`;
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
      name: values.name,
      email: values.email,
      country: values.country,
      vehicle: values.vehicle || "Not specified",
      budget: values.budget || "Not specified",
      message: values.message || "No additional message",
    }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message ?? "Submission failed");
};

const InquiryForm = ({
  variant = "compact",
  defaultVehicle = "",
  onSuccess,
  className,
}: InquiryFormProps) => {
  const { user } = useAuth();
  const { logActivity } = useUserData();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      vehicle: defaultVehicle,
      budget: "",
      message: "",
    },
  });

  const onSubmit = async (values: InquiryValues) => {
    // The row is the record of the request; the email is a convenience on top.
    try {
      // Spelled out rather than passed whole: the project compiles with
      // strictNullChecks off, which makes zod infer every field as optional.
      await saveQuoteRequest(
        {
          name: values.name,
          email: values.email,
          country: values.country,
          vehicle: values.vehicle,
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
        detail: values.vehicle?.trim() || "General inquiry",
        href: "/dashboard/activity",
      });
    }

    reset({ name: "", email: "", country: "", vehicle: "", budget: "", message: "" });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-3", className)}>
      <div>
        <Label htmlFor="inquiry-name" className="text-xs font-medium">
          Name
        </Label>
        <Input
          id="inquiry-name"
          placeholder="Your full name"
          autoComplete="name"
          {...register("name")}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="inquiry-email" className="text-xs font-medium">
          Email
        </Label>
        <Input
          id="inquiry-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
        />
        <FieldError>{errors.email?.message}</FieldError>
      </div>

      <div>
        <Label className="text-xs font-medium">Destination country</Label>
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
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

      <div>
        <Label htmlFor="inquiry-vehicle" className="text-xs font-medium">
          Vehicle of interest{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="inquiry-vehicle"
          placeholder="e.g. Toyota Land Cruiser Prado"
          {...register("vehicle")}
        />
      </div>

      <div>
        <Label className="text-xs font-medium">
          Budget <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Controller
          name="budget"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget" />
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
      </div>

      {variant === "full" && (
        <div>
          <Label htmlFor="inquiry-message" className="text-xs font-medium">
            Message{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="inquiry-message"
            rows={4}
            placeholder="Tell us more about what you're looking for…"
            {...register("message")}
          />
          <FieldError>{errors.message?.message}</FieldError>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Inquiry
          </>
        )}
      </Button>

      <p className="text-[11px] text-muted-foreground text-center leading-snug">
        We reply within 24 hours. Your details are never shared.
      </p>
    </form>
  );
};

export default InquiryForm;
