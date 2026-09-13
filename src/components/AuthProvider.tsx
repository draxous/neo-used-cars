import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import type { AuthError as SupabaseAuthError } from "@supabase/supabase-js";
import {
  Account,
  AuthContext,
  AuthError,
  EmailNotVerifiedError,
  RegisterResult,
  RegisterValues,
  toAccount,
} from "@/lib/auth";
import { authRedirectTo, setRemember, supabase } from "@/lib/supabase";

const NOT_CONFIGURED =
  "Accounts aren't connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.";

/** Narrows to the client, so every call below can assume it exists. */
const client = () => {
  if (!supabase) throw new AuthError(NOT_CONFIGURED);
  return supabase;
};

/** Supabase messages are decent, but a few are worth saying in our own words. */
const describe = (error: SupabaseAuthError): string => {
  const message = error.message.toLowerCase();
  if (message.includes("invalid login credentials")) {
    // One message for a missing account and a wrong password on purpose: saying
    // which is wrong would let anyone test whether an email is registered.
    return "That email and password don't match an account.";
  }
  if (message.includes("rate limit") || error.status === 429) {
    return "Too many attempts just now. Wait a minute and try again.";
  }
  if (message.includes("weak password")) {
    return "Pick a stronger password — at least 8 characters with a letter and a number.";
  }
  if (message.includes("same password")) {
    return "That's already your password. Choose a different one.";
  }
  return error.message;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    // Covers the first paint, the token refresh, sign-out in another tab, and
    // the session minted when someone follows a confirmation or reset link.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAccount(session.user) : null);
      setReady(true);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    setRemember(remember);
    const { data, error } = await client().auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new EmailNotVerifiedError(email.trim());
      }
      throw new AuthError(describe(error));
    }

    const account = toAccount(data.user);
    setUser(account);
    return account;
  }, []);

  const register = useCallback(async (values: RegisterValues): Promise<RegisterResult> => {
    const email = values.email.trim();
    setRemember(true);

    const { data, error } = await client().auth.signUp({
      email,
      password: values.password,
      options: {
        // Kept on the user record, so the profile survives without a table.
        data: {
          name: values.name,
          country: values.country,
          phone: values.phone ?? null,
          company: values.company ?? null,
        },
        emailRedirectTo: authRedirectTo("/verify-email"),
      },
    });

    if (error) throw new AuthError(describe(error));

    // Supabase hands back a decoy user with no identities when the address is
    // already registered, rather than confirming it exists. Say as little.
    if (data.user && data.user.identities?.length === 0) {
      throw new AuthError(
        "If that address doesn't already have an account, a confirmation email is on its way."
      );
    }

    if (data.session?.user) {
      setUser(toAccount(data.session.user));
      return { email, signedIn: true };
    }

    return { email, signedIn: false };
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    void supabase?.auth.signOut();
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await client().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectTo("/reset-password"),
    });
    // An unknown address is not an error here — the caller shows the same
    // "check your inbox" message either way so addresses can't be probed.
    if (error && error.status !== 400) throw new AuthError(describe(error));
  }, []);

  const resetPassword = useCallback(async (password: string) => {
    const { error } = await client().auth.updateUser({ password });
    if (error) throw new AuthError(describe(error));
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    const { error } = await client().auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: authRedirectTo("/verify-email") },
    });
    if (error) throw new AuthError(describe(error));
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      signIn,
      register,
      signOut,
      requestPasswordReset,
      resetPassword,
      resendVerification,
    }),
    [user, ready, signIn, register, signOut, requestPasswordReset, resetPassword, resendVerification]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
