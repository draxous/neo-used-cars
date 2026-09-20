import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Car as CarIcon,
  Heart,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsAdmin } from "@/lib/admin";
import { useAuth } from "@/lib/auth";
import { useUserData } from "@/lib/userData";
import { cn } from "@/lib/utils";
import Logo from "./Logo";

/**
 * Chrome for the signed-in area. Deliberately not the marketing header: a
 * compact bar, four tabs, and a way back out to the public site.
 */
const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  // Signing in the usual way lands here, so the team needs a way through.
  const { isAdmin } = useIsAdmin();
  const { favorites, purchases } = useUserData();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!user) return null;

  const tabs = [
    { to: "/dashboard/home", label: "Home", icon: LayoutDashboard },
    { to: "/dashboard/activity", label: "Activity", icon: History },
    { to: "/dashboard/favorites", label: "Favorites", icon: Heart, count: favorites.length },
    { to: "/dashboard/vehicles", label: "My Vehicles", icon: CarIcon, count: purchases.length },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          {/* Identity row */}
          <div className="flex items-center justify-between gap-4 py-3">
            <Logo to="/dashboard/home" size="sm" tagline="My account" className="gap-2.5" />

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button asChild variant="outline" size="sm" className="hidden sm:flex gap-1.5">
                  <Link to="/admin">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Admin panel
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-muted-foreground">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to site
                </Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:flex bg-primary hover:bg-primary/90 gap-1.5">
                <Link to="/search">
                  <Search className="h-4 w-4" />
                  Search stock
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary transition-colors outline-none">
                  <span className="h-7 w-7 rounded-full hero-gradient text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-foreground hidden sm:inline max-w-[8rem] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="gap-2 cursor-pointer">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Admin panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/inquiry" className="gap-2 cursor-pointer">
                      <MessageSquareQuote className="h-4 w-4" />
                      Contact our team
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/" className="gap-2 cursor-pointer sm:hidden">
                      <ArrowLeft className="h-4 w-4" />
                      Back to site
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="gap-2 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tabs */}
          <nav aria-label="Account sections" className="flex gap-1 overflow-x-auto -mb-px">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )
                }
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="rounded-full bg-secondary text-secondary-foreground text-[11px] leading-none px-1.5 py-0.5">
                    {tab.count}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border py-5">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Neo LLC — The Japanese Used Car Exporter</p>
          <div className="flex gap-4">
            <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link to="/inquiry" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/" className="hover:text-primary transition-colors">Public site</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
