import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/admin";

/**
 * Gate for /admin. This only decides what to render — the real boundary is the
 * row-level security in supabase/schema.sql, which returns nothing to a
 * non-admin however they reach these screens.
 */
const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, ready } = useAuth();
  const { isAdmin, checked } = useIsAdmin();
  const location = useLocation();

  if (!ready || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (!user) {
    const target = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(target)}`} replace />;
  }

  // Not an admin: say nothing about what lives here, just send them home.
  if (!isAdmin) return <Navigate to="/dashboard/home" replace />;

  return <>{children}</>;
};

export default RequireAdmin;
