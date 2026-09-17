import { Link, NavLink, Outlet } from "react-router-dom";
import { ArrowLeft, Inbox, MessagesSquare, ShieldCheck, Users } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/admin";
import { cn } from "@/lib/utils";

const sections = [
  { to: "/admin/quotes", label: "Quote requests", icon: Inbox },
  { to: "/admin/messages", label: "Order messages", icon: MessagesSquare },
];

/** Only a super admin can invite, so only they get the tab. */
const superAdminSections = [{ to: "/admin/team", label: "Team", icon: Users }];

/** Shell for /admin: identity row, section nav, and the active screen. */
const AdminLayout = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useIsAdmin();
  const tabs = isSuperAdmin ? [...sections, ...superAdminSections] : sections;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            <Logo to="/admin/quotes" size="sm" tagline="Admin" />

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
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
