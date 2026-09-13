import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

/**
 * Gate for signed-in routes. Sends visitors to the sign-in page carrying the
 * page they were after, so they land back where they were headed.
 *
 * An account with an unconfirmed email gets no further than /verify-email:
 * confirmation is required, not encouraged.
 */
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, ready } = useAuth();
  const location = useLocation();

  // Wait for the stored session to load, otherwise a refresh bounces you out.
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  const target = `${location.pathname}${location.search}`;

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(target)}`} replace />;
  }

  if (!user.emailVerified) {
    const query = new URLSearchParams({ email: user.email, redirect: target });
    return <Navigate to={`/verify-email?${query.toString()}`} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
