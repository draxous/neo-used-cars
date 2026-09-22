export interface NavChild {
  name: string;
  href: string;
  description: string;
}

export interface NavItem {
  name: string;
  href: string;
  submenu?: NavChild[];
}

/** Top-level site navigation: Home / Buy / Resources / Company. */
export const navigation: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "Buy",
    href: "/stock-cars",
    submenu: [
      {
        name: "Search Cars",
        href: "/search",
        description: "Filter our stock by make, model, price, year and more",
      },
      {
        name: "Stock",
        href: "/stock-cars",
        description: "Browse our inventory of ready-to-purchase vehicles",
      },
      {
        name: "Auctions",
        href: "/auctions",
        description: "Explore live and upcoming Japanese vehicle auctions",
      },
    ],
  },
  {
    name: "Resources",
    href: "/resources",
    submenu: [
      {
        name: "Import Guides",
        href: "/resources",
        description: "Step-by-step roadmap, auction sheets, FOB vs CIF, and country rules",
      },
      {
        name: "Import FAQ",
        href: "/faq",
        description: "Frequently asked questions on auto imports from Japan",
      },
    ],
  },
  {
    name: "Company",
    href: "/about-us",
    submenu: [
      {
        name: "About Us",
        href: "/about-us",
        description: "Learn about our mission, team, and history",
      },
      {
        name: "Contact Us",
        href: "/inquiry",
        description: "Get in touch with our team for support or inquiries",
      },
    ],
  },
];
