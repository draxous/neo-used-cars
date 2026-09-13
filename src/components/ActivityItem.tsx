import { Link } from "react-router-dom";
import { Car as CarIcon, Heart, HeartOff, MessageSquareQuote, Ship, UserPlus } from "lucide-react";
import { ActivityEvent, ActivityType, timeAgo } from "@/lib/userData";
import { cn } from "@/lib/utils";

const icons: Record<ActivityType, typeof CarIcon> = {
  account: UserPlus,
  "favorite-added": Heart,
  "favorite-removed": HeartOff,
  inquiry: MessageSquareQuote,
  order: CarIcon,
  shipping: Ship,
};

/** Muted for the things you did, coloured for the things we did. */
const tones: Record<ActivityType, string> = {
  account: "bg-secondary text-secondary-foreground",
  "favorite-added": "bg-destructive/10 text-destructive",
  "favorite-removed": "bg-secondary text-muted-foreground",
  inquiry: "bg-accent/15 text-accent",
  order: "bg-primary/10 text-primary",
  shipping: "bg-primary/10 text-primary",
};

interface ActivityItemProps {
  event: ActivityEvent;
  /** Tighter spacing for the dashboard sidebar. */
  compact?: boolean;
}

const ActivityItem = ({ event, compact = false }: ActivityItemProps) => {
  const Icon = icons[event.type];

  const body = (
    <>
      <span
        className={cn(
          "rounded-full flex items-center justify-center flex-shrink-0",
          compact ? "h-7 w-7" : "h-9 w-9",
          tones[event.type]
        )}
      >
        <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground truncate">{event.title}</span>
        {event.detail && (
          <span className="block text-xs text-muted-foreground truncate">{event.detail}</span>
        )}
      </span>
      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
        {timeAgo(event.at)}
      </span>
    </>
  );

  return (
    <li>
      {event.href ? (
        <Link
          to={event.href}
          className={cn(
            "flex items-center gap-3 rounded-md hover:bg-secondary transition-colors",
            compact ? "px-2 py-2 -mx-2" : "px-3 py-3 -mx-1"
          )}
        >
          {body}
        </Link>
      ) : (
        <div className={cn("flex items-center gap-3", compact ? "px-2 py-2" : "px-3 py-3")}>
          {body}
        </div>
      )}
    </li>
  );
};

export default ActivityItem;
