import { Check } from "lucide-react";
import { ShipmentStage, shipmentStages, stageIndex } from "@/lib/userData";
import { cn } from "@/lib/utils";

interface ShipmentTrackerProps {
  stage: ShipmentStage;
  /** Drops the per-step descriptions — used on the dashboard summary card. */
  compact?: boolean;
}

/** Five-step export pipeline, from payment to arrival at the customer's port. */
const ShipmentTracker = ({ stage, compact = false }: ShipmentTrackerProps) => {
  const current = stageIndex(stage);

  return (
    <ol className="flex items-start" aria-label="Shipment progress">
      {shipmentStages.map((entry, index) => {
        const done = index <= current;
        const isCurrent = index === current;
        return (
          <li key={entry.value} className="flex-1 min-w-0">
            <div className="flex items-center">
              <span
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors",
                  done
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border text-muted-foreground"
                )}
              >
                {done ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-border" />
                )}
              </span>
              {index < shipmentStages.length - 1 && (
                <span
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    index < current ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
            <p
              className={cn(
                "text-[11px] mt-1.5 pr-2 leading-tight",
                isCurrent ? "text-primary font-medium" : done ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {entry.label}
            </p>
            {!compact && (
              <p className="text-[11px] text-muted-foreground mt-0.5 pr-2 leading-snug hidden sm:block">
                {entry.description}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default ShipmentTracker;
