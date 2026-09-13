import InquiryForm from "./InquiryForm";
import { cn } from "@/lib/utils";

interface InquiryBoxProps {
  className?: string;
  variant?: "compact" | "full";
}

/** The bordered quote card that sits at the top right of the hero. */
const InquiryBox = ({ className, variant = "compact" }: InquiryBoxProps) => {
  return (
    <div
      className={cn(
        "bg-card rounded-xl card-shadow-hover p-5 w-full max-w-[400px] animate-slide-up",
        className
      )}
    >
      <div className="mb-4 pb-3 border-b border-border">
        <h3 className="font-display font-bold text-xl text-foreground">
          Get a <span className="text-primary">Free Quote</span>
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tell us what you need — we'll find it in Japan.
        </p>
      </div>
      <InquiryForm variant={variant} />
    </div>
  );
};

export default InquiryBox;
