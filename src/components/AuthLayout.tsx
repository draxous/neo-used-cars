import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import Logo from "./Logo";

const benefits = [
  "Save vehicles and come back to them from any device",
  "Track your inquiries and auction bids in one place",
  "Get new arrivals that match your search before they're listed",
];

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Rendered under the card, e.g. the link across to the other auth page. */
  footer?: ReactNode;
}

/**
 * Split layout shared by sign-in and registration: brand and benefits on the
 * left, the form on the right. On phones the panel shrinks to a header so the
 * form is the first thing in reach.
 */
const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => (
  <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,480px)_1fr]">
    {/* Brand panel */}
    <aside className="hero-gradient text-primary-foreground px-6 py-8 lg:px-10 lg:py-12 flex flex-col">
      <Logo to="/" tone="onDark" size="md" />

      <div className="hidden lg:block mt-auto">
        <h2 className="font-display text-3xl font-bold leading-tight">
          Your account,
          <span className="block text-accent">your shortlist.</span>
        </h2>
        <ul className="mt-6 space-y-3">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-primary-foreground/85">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-accent" />
              </span>
              <span className="text-sm leading-relaxed">{benefit}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-primary-foreground/60 mt-8 pt-6 border-t border-primary-foreground/15">
          Exporting inspected Japanese vehicles worldwide, FOB from Yokohama, Nagoya, Kobe,
          Osaka and Fukuoka.
        </p>
      </div>
    </aside>

    {/* Form column */}
    <main className="px-4 py-8 sm:px-6 lg:px-10 lg:py-12 flex flex-col">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors w-fit mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>

        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>

        <div className="mt-6">{children}</div>

        {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
      </div>
    </main>
  </div>
);

export default AuthLayout;
