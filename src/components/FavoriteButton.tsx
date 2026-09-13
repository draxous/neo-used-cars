import { useLocation, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Car } from "@/data/cars";
import { useAuth } from "@/lib/auth";
import { useUserData } from "@/lib/userData";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  car: Car;
  /** "overlay" sits on a card image; "inline" sits in a row of buttons. */
  variant?: "overlay" | "inline";
  /** Adds the wording — used where there's room, like the detail page. */
  label?: boolean;
  className?: string;
}

/**
 * Heart toggle. Signed-out visitors are sent to sign in and returned to the
 * page they were on, rather than losing the click.
 */
const FavoriteButton = ({ car, variant = "overlay", label = false, className }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useUserData();
  const navigate = useNavigate();
  const location = useLocation();

  const saved = Boolean(user) && isFavorite(car.id);

  const handleClick = (event: React.MouseEvent) => {
    // Cards wrap these buttons in links — don't follow them.
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      const target = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }

    toggleFavorite(car);
    toast.success(saved ? "Removed from favourites" : "Saved to favourites", {
      description: `${car.year} ${car.make} ${car.model}`,
      action: saved ? undefined : { label: "View", onClick: () => navigate("/dashboard/favorites") },
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from favourites" : "Save to favourites"}
      title={saved ? "Remove from favourites" : "Save to favourites"}
      className={cn(
        "flex items-center justify-center gap-2 transition-colors",
        variant === "overlay"
          ? "h-8 w-8 rounded-full bg-card/90 hover:bg-card shadow-sm"
          : cn(
              "h-10 rounded-md border border-border hover:border-primary text-sm font-medium",
              label ? "px-4 text-foreground" : "w-10"
            ),
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          saved ? "fill-destructive text-destructive" : "text-muted-foreground"
        )}
      />
      {label && (saved ? "Saved to favourites" : "Save to favourites")}
    </button>
  );
};

export default FavoriteButton;
