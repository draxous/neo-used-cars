/**
 * Supabase client — the account backend.
 *
 * Keys live in `.env` (see `.env.example`); the anon key is safe in the bundle,
 * it only grants what your row-level security policies allow.
 *
 * The site has to keep working for visitors who only want to browse cars, so a
 * missing config is not fatal here: `isSupabaseConfigured` stays false and the
 * auth calls surface a clear message instead of the app failing to boot.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && anonKey);

/** Storage can throw in private mode or when cookies are blocked. */
const safe = <T,>(run: () => T, fallback: T): T => {
  try {
    return run();
  } catch {
    return fallback;
  }
};

const REMEMBER_KEY = "neo.auth.remember";

/**
 * "Keep me signed in" decides which store the session token lands in, so an
 * unticked box means the session dies with the tab. Set before signing in.
 */
export const setRemember = (remember: boolean) =>
  safe(() => localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0"), undefined);

const activeStore = (): Storage =>
  safe(() => (localStorage.getItem(REMEMBER_KEY) === "0" ? sessionStorage : localStorage), localStorage);

/** Routes the session token to local or session storage based on that choice. */
const rememberAwareStorage = {
  getItem: (key: string) => safe(() => activeStore().getItem(key), null),
  setItem: (key: string, value: string) => safe(() => activeStore().setItem(key, value), undefined),
  // Clear both: the remember flag may have flipped since the token was written.
  removeItem: (key: string) =>
    safe(() => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }, undefined),
};

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        storage: rememberAwareStorage,
        persistSession: true,
        autoRefreshToken: true,
        // Confirmation and recovery links land back on the site carrying their
        // tokens; this is what turns one into a session.
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : null;

/** Absolute URL Supabase should send people back to after an email link. */
export const authRedirectTo = (path: string) => `${window.location.origin}${path}`;
