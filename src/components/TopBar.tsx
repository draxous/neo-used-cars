import { ChevronDown, Clock, LayoutDashboard, LogOut, Mail, Phone, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";

const TopBar = () => {
  const [japanTime, setJapanTime] = useState("");
  const { user, ready, signOut } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Tokyo",
        hour: "numeric",
        minute: "2-digit",
        weekday: "long",
        hour12: true,
      };
      setJapanTime(now.toLocaleString("en-US", options));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-gradient text-primary-foreground py-2 px-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Japan Time: {japanTime}</span>
          </div>
          <a href="mailto:neollcjp@gmail.com" className="flex items-center gap-2 hover:text-accent transition-colors">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Send Email</span>
          </a>
        </div>
        <div className="flex items-center gap-6">
          <a href="tel:+818097185080" className="flex items-center gap-2 hover:text-accent transition-colors">
            <Phone className="h-4 w-4" />
            <span>+81-80-9718-5080</span>
          </a>
          {/* Account — swaps for a menu once you're signed in */}
          {ready && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:text-accent transition-colors outline-none">
                <span className="h-5 w-5 rounded-full bg-primary-foreground/15 flex items-center justify-center text-[10px] font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[10rem] truncate">{user.name.split(" ")[0]}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/home" className="gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    My dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <Link to="/register" className="hover:text-accent transition-colors">
                Register
              </Link>
              <span>|</span>
              <Link to="/login" className="hover:text-accent transition-colors">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
