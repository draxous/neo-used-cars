import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, MessageSquareQuote, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { navigation, type NavItem } from "@/config/nav";
import InquiryForm from "./InquiryForm";
import Logo from "./Logo";
import { cn } from "@/lib/utils";

/** Exact match for the home route, prefix match for every other section. */
const isPathActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/** A top-level item is active when its own route or any of its children is active. */
const isItemActive = (pathname: string, item: NavItem) =>
  isPathActive(pathname, item.href) ||
  (item.submenu?.some((child) => isPathActive(pathname, child.href)) ?? false);

const Header = () => {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const openQuote = () => {
    setMobileMenuOpen(false);
    setQuoteOpen(true);
  };

  return (
    <header className="bg-card sticky top-0 z-50 card-shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Logo to="/" size="lg" taglineClassName="hidden sm:block" />

          <div className="flex items-center gap-2">
            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                {navigation.map((item) =>
                  item.submenu ? (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuTrigger
                        className={cn(
                          "text-sm font-medium uppercase tracking-wide bg-transparent",
                          isItemActive(pathname, item) && "text-primary bg-secondary"
                        )}
                      >
                        {item.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="w-[320px] p-2">
                          {item.submenu.map((child) => (
                            <li key={child.name}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={child.href}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-secondary focus:bg-secondary",
                                    isPathActive(pathname, child.href) && "bg-secondary"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "text-sm font-medium leading-none text-foreground",
                                      isPathActive(pathname, child.href) && "text-primary"
                                    )}
                                  >
                                    {child.name}
                                  </div>
                                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                    {child.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          aria-current={isItemActive(pathname, item) ? "page" : undefined}
                          className={cn(
                            "inline-flex h-10 items-center px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-all hover:text-primary hover:bg-secondary",
                            isItemActive(pathname, item)
                              ? "text-primary bg-secondary"
                              : "text-foreground"
                          )}
                        >
                          {item.name}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Quote CTA — persistent inquiry entry point */}
            <Button
              onClick={openQuote}
              className="hidden sm:flex bg-accent hover:bg-accent/90 text-accent-foreground gap-2 ml-1"
            >
              <MessageSquareQuote className="h-4 w-4" />
              Get a Quote
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation — accordion-style groups */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-slide-up">
            {navigation.map((item) =>
              item.submenu ? (
                <div key={item.name}>
                  <button
                    onClick={() => setOpenGroup(openGroup === item.name ? null : item.name)}
                    aria-expanded={openGroup === item.name}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-sm font-medium uppercase tracking-wide rounded-md transition-all hover:text-primary hover:bg-secondary",
                      isItemActive(pathname, item)
                        ? "text-primary bg-secondary"
                        : "text-foreground"
                    )}
                  >
                    {item.name}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openGroup === item.name && "rotate-180"
                      )}
                    />
                  </button>
                  {openGroup === item.name && (
                    <div className="pl-4 border-l border-border ml-4">
                      {item.submenu.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-current={isPathActive(pathname, child.href) ? "page" : undefined}
                          className={cn(
                            "block px-4 py-2.5 text-sm rounded-md transition-all hover:text-primary",
                            isPathActive(pathname, child.href)
                              ? "text-primary font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isItemActive(pathname, item) ? "page" : undefined}
                  className={cn(
                    "block px-4 py-3 text-sm font-medium uppercase tracking-wide rounded-md transition-all hover:text-primary hover:bg-secondary",
                    isItemActive(pathname, item)
                      ? "text-primary bg-secondary"
                      : "text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              )
            )}
            <Button
              onClick={openQuote}
              className="w-full mt-3 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <MessageSquareQuote className="h-4 w-4" />
              Get a Quote
            </Button>
          </nav>
        )}
      </div>

      {/* Slide-out inquiry panel */}
      <Sheet open={quoteOpen} onOpenChange={setQuoteOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="font-display text-2xl">
              Get a <span className="text-primary">Free Quote</span>
            </SheetTitle>
            <SheetDescription>
              Tell us what you're looking for and our team will reply within 24 hours.
            </SheetDescription>
          </SheetHeader>
          <InquiryForm variant="full" onSuccess={() => setQuoteOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
