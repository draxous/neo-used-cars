/**
 * Front-end account session, backed by Supabase Auth.
 *
 * Passwords are hashed and verified by Supabase — none of them reach this file.
 * Email confirmation is enforced: a new account has no session until the link
 * in the welcome email is clicked (see `RequireAuth` and `/verify-email`).
 */
import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export interface Account {
  /** Supabase user id — the foreign key rows in `quotes` and `profiles` use. */
  id: string;
  name: string;
  email: string;
  country: string;
  phone?: string;
  company?: string;
  /** ISO timestamp — shown on the account panel. */
  createdAt: string;
  /** False until the address has been confirmed from the welcome email. */
  emailVerified: boolean;
}

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
  country: string;
  phone?: string;
  company?: string;
}

/** What `register` did, so the caller knows which screen to show next. */
export interface RegisterResult {
  email: string;
  /** True when Supabase issued a session outright (confirmations disabled). */
  signedIn: boolean;
}

export interface AuthContextValue {
  user: Account | null;
  /** False until the stored session has been read, so guards don't flash. */
  ready: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<Account>;
  register: (values: RegisterValues) => Promise<RegisterResult>;
  signOut: () => void;
  /** Emails a password reset link. Resolves the same way for unknown addresses. */
  requestPasswordReset: (email: string) => Promise<void>;
  /** Sets a new password for the session opened by a recovery link. */
  resetPassword: (password: string) => Promise<void>;
  /** Sends the confirmation email again. */
  resendVerification: (email: string) => Promise<void>;
}

/** Supabase stores the profile fields on the user; this unpacks them. */
export const toAccount = (user: User): Account => {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    name: typeof meta.name === "string" ? meta.name : "",
    email: user.email ?? "",
    country: typeof meta.country === "string" ? meta.country : "",
    phone: typeof meta.phone === "string" ? meta.phone : undefined,
    company: typeof meta.company === "string" ? meta.company : undefined,
    createdAt: user.created_at,
    emailVerified: Boolean(user.email_confirmed_at ?? user.confirmed_at),
  };
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
};

/** Thrown for problems worth showing above the form rather than beside a field. */
export class AuthError extends Error {}

/** Raised when the address exists but hasn't been confirmed yet. */
export class EmailNotVerifiedError extends AuthError {
  constructor(public email: string) {
    super("Confirm your email address before signing in.");
  }
}

/**
 * Only same-origin paths are honoured, so a crafted `?redirect=` can't bounce
 * someone to another site after they sign in.
 */
export const safeRedirect = (value: string | null, fallback = "/dashboard/home"): string => {
  if (!value) return fallback;
  const decoded = decodeURIComponent(value);
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;
  return decoded;
};

/** Friendly names for the destinations people are most often bounced from. */
const pathNames: Record<string, string> = {
  "/dashboard/home": "your dashboard",
  "/dashboard": "your dashboard",
  "/search": "your search results",
  "/stock-cars": "our stock list",
  "/inquiry": "your inquiry",
  "/auctions": "auction sourcing",
  "/": "the home page",
};

/** "/dashboard/home" -> "your dashboard", for the "you'll return to…" hint. */
export const describePath = (path: string): string => {
  const [clean] = path.split("?");
  const named = pathNames[clean.replace(/\/$/, "") || "/"];
  if (named) return named;

  const segments = clean.split("/").filter(Boolean);
  if (segments.length === 0) return "the home page";
  const words = segments[segments.length - 1].replace(/-/g, " ");
  return `the ${words} page`;
};
