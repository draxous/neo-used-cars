import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { AlertCircle, Loader2, Send, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import {
  OrderMessage,
  listOrderMessages,
  messageTopics,
  sendOrderMessage,
} from "@/lib/orderMessages";
import { formatDate, Purchase, shipmentStages, stageIndex } from "@/lib/userData";
import { cn } from "@/lib/utils";

const MESSAGE_LIMIT = 2000;

const schema = z.object({
  topic: z.string().min(1, "Pick what this is about"),
  message: z
    .string()
    .min(10, "Tell us a little more so we can answer properly")
    .max(MESSAGE_LIMIT, "Message is too long"),
});

type Values = z.infer<typeof schema>;

interface OrderMessageSheetProps {
  purchase: Purchase | null;
  carLabel?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Right-hand panel for asking about a vehicle already bought. Shows what has
 * already been asked about this order, so it reads as a conversation rather
 * than a form that swallows messages.
 */
const OrderMessageSheet = ({
  purchase,
  carLabel,
  open,
  onOpenChange,
}: OrderMessageSheetProps) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<OrderMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    register,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { topic: "", message: "" },
  });

  const message = watch("message") ?? "";

  const loadHistory = useCallback(async (orderId: string) => {
    setLoadingHistory(true);
    try {
      setHistory(await listOrderMessages(orderId));
    } catch {
      // A failed history load shouldn't stop someone asking a new question.
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !purchase) return;
    reset({ topic: "", message: "" });
    setFormError(null);
    void loadHistory(purchase.id);
  }, [open, purchase, reset, loadHistory]);

  if (!purchase) return null;

  const stageLabel = shipmentStages[stageIndex(purchase.stage)]?.label;

  const onSubmit = async (values: Values) => {
    if (!user) return;
    setFormError(null);
    try {
      await sendOrderMessage(
        {
          orderId: purchase.id,
          carId: purchase.carId,
          carLabel,
          topic: values.topic,
          message: values.message,
        },
        user.id
      );
      toast.success("Message sent", {
        description: "We'll reply by email, usually within one business day.",
      });
      reset({ topic: "", message: "" });
      void loadHistory(purchase.id);
    } catch (error) {
      setFormError(
        "We couldn't send that just now. Please try again, or email us directly."
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-xl">Ask about this order</SheetTitle>
          <SheetDescription>
            Our team can see the full history of this vehicle — ask anything about it.
          </SheetDescription>
        </SheetHeader>

        {/* Which vehicle this is about, so there's no doubt what's being asked */}
        <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
          <p className="font-medium text-sm text-foreground">
            {carLabel ?? purchase.carId}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{purchase.id}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-primary font-medium">
              <Ship className="h-3.5 w-3.5" />
              {stageLabel}
            </span>
            {purchase.etaDate && <span>ETA {formatDate(purchase.etaDate)}</span>}
            {purchase.vessel && <span>{purchase.vessel}</span>}
          </div>
        </div>

        {/* What's already been asked about this order */}
        {loadingHistory ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="sr-only">Loading previous messages</span>
          </div>
        ) : (
          history.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Your messages
              </h3>
              <ol className="space-y-3">
                {history.map((item) => (
                  <li key={item.id} className="rounded-lg bg-secondary/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-foreground">{item.topic}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">
                      {item.message}
                    </p>
                    {item.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="mt-2.5 rounded-md border-l-2 border-primary bg-card px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-primary">Neo team</span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap break-words">
                          {reply.body}
                        </p>
                      </div>
                    ))}
                    {item.replies.length === 0 &&
                      (item.status === "answered" ? (
                        <p className="text-[11px] text-primary mt-1.5">Answered by email</p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground mt-1.5">Awaiting a reply</p>
                      ))}
                  </li>
                ))}
              </ol>
            </div>
          )
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <Label className="text-xs font-medium">What's this about?</Label>
            <Controller
              name="topic"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5" aria-invalid={Boolean(errors.topic)}>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {messageTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.topic && (
              <p className="text-xs text-destructive mt-1">{errors.topic.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <Label htmlFor="order-message" className="text-xs font-medium">
                Your question
              </Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {message.length}/{MESSAGE_LIMIT}
              </span>
            </div>
            <Textarea
              id="order-message"
              rows={5}
              maxLength={MESSAGE_LIMIT}
              placeholder="e.g. Has the vessel departed yet, and when should I expect the B/L?"
              aria-invalid={Boolean(errors.message)}
              className="mt-1.5 resize-none"
              {...register("message")}
            />
            {errors.message && (
              <p className="text-xs text-destructive mt-1">{errors.message.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn("w-full gap-2 bg-primary hover:bg-primary/90")}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send message
              </>
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground text-center leading-snug">
            Our replies appear right here, above this form.
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default OrderMessageSheet;
