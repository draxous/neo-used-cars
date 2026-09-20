import { Suspense } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  Contact,
  Inbox,
  LayoutDashboard,
  MessagesSquare,
  Loader2,
  Settings,
  ShieldCheck,
  Ship,
  ShoppingCart,
  Users,
} from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/admin";
import { cn } from "@/lib/utils";

interface Section {
  to: string;
  label: string;
  icon: typeof Car;
  /** Match the path exactly — /admin would otherwise light up on every tab. */
  end?: boolean;
}

const sections: Section[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/inventory", label: "Inventory", icon: Car },
  { to: "/admin/orders", label: "Orders", icon: Ship },
  { to: "/admin/requests", label: "Buy & bid", icon: ShoppingCart },
  { to: "/admin/quotes", label: "Quote requests", icon: Inbox },
  { to: "/admin/messages", label: "Order messages", icon: MessagesSquare },
  { to: "/admin/customers", label: "Customers", icon: Contact },
];

/** Only a super admin can invite, so only they get the tab. */
const superAdminSections: Section[] = [{ to: "/admin/team", label: "Team", icon: Users }];

/** Everyone has an account to manage; managers also edit the site here. */
const trailingSections: Section[] = [{ to: "/admin/settings", label: "Settings", icon: Settings }];

/** Shell for /admin: identity row, section nav, and the active screen. */
const AdminLayout = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useIsAdmin();
  const tabs = [...sections, ...(isSuperAdmin ? superAdminSections : []), ...trailingSections];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            <Logo to="/admin" size="sm" tagline="Admin" />

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {user?.email}
              </span>
              <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to site
                </Link>
              </Button>
            </div>
          </div>

          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((section) => (
              <NavLink
                key={section.to}
                to={section.to}
                end={section.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="sr-only">Loading</span>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;
