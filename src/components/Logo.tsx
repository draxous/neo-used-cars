import { useId } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/** "brand" sits on light surfaces; "onDark" sits on the hero gradient. */
type LogoTone = "brand" | "onDark";

type LogoSize = "sm" | "md" | "lg";

const SIZES: Record<LogoSize, { mark: string; name: string; tagline: string }> = {
  sm: { mark: "h-9 w-9", name: "text-lg", tagline: "text-[11px]" },
  md: { mark: "h-10 w-10", name: "text-xl", tagline: "text-xs" },
  lg: { mark: "h-12 w-12", name: "text-2xl", tagline: "text-xs" },
};

const NAVY_TOP = "hsl(210,70%,28%)";
const NAVY_BOTTOM = "hsl(210,50%,15%)";
const SUNRISE = "hsl(25,95%,55%)";
const WHITE = "hsl(0,0%,100%)";

interface LogoMarkProps {
  tone?: LogoTone;
  className?: string;
}

/**
 * Monogram mark: a geometric "N" whose diagonal doubles as a motion stroke,
 * set against a rising-sun disc — a nod to the Japanese origin of the stock.
 */
export const LogoMark = ({ tone = "brand", className }: LogoMarkProps) => {
  const id = useId();
  const gradientId = `${id}-bg`;
  const clipId = `${id}-clip`;
  const onDark = tone === "onDark";

  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={`${siteConfig.name} logo`}
      className={cn("flex-shrink-0", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={onDark ? WHITE : NAVY_TOP} stopOpacity={onDark ? 0.2 : 1} />
          <stop offset="100%" stopColor={onDark ? WHITE : NAVY_BOTTOM} stopOpacity={onDark ? 0.08 : 1} />
        </linearGradient>
        <clipPath id={clipId}>
          <rect width="48" height="48" rx="11" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect width="48" height="48" rx="11" fill={`url(#${gradientId})`} />
        {/* Diagonal first so the stems cut clean joints over it */}
        <path d="M13 13h6.5l15.5 22h-6.5z" fill={SUNRISE} />
        <path d="M13 13h5v22h-5zM30 13h5v22h-5z" fill={WHITE} />
      </g>
      {onDark && (
        <rect
          x="0.75"
          y="0.75"
          width="46.5"
          height="46.5"
          rx="10.25"
          fill="none"
          stroke={WHITE}
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
};

interface LogoProps {
  tone?: LogoTone;
  size?: LogoSize;
  /** Text under the name; pass false to show the name alone. */
  tagline?: string | false;
  /** Extra classes for the tagline — e.g. hiding it on narrow screens. */
  taglineClassName?: string;
  /** Wraps the logo in a link when set. */
  to?: string;
  className?: string;
}

/** Mark plus wordmark. Inherits its text colour from the surrounding surface. */
const Logo = ({
  tone = "brand",
  size = "md",
  tagline = siteConfig.tagline,
  taglineClassName,
  to,
  className,
}: LogoProps) => {
  const sizes = SIZES[size];

  const content = (
    <>
      <LogoMark tone={tone} className={sizes.mark} />
      <div className="leading-tight">
        <span className={cn("block font-display font-bold", sizes.name)}>{siteConfig.name}</span>
        {tagline && (
          <span
            className={cn(
              "block",
              sizes.tagline,
              tone === "onDark" ? "text-primary-foreground/70" : "text-muted-foreground",
              taglineClassName
            )}
          >
            {tagline}
          </span>
        )}
      </div>
    </>
  );

  const classes = cn("flex items-center gap-3 flex-shrink-0", className);

  return to ? (
    <Link to={to} className={cn(classes, "w-fit")}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
};

export default Logo;
