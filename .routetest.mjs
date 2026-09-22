import { matchRoutes } from "react-router-dom";

// Mirrors the <Route> table in src/App.tsx
const routes = [
  { path: "/", id: "Index" },
  { path: "/stock-cars", id: "StockCars(all)" },
  { path: "/stock-cars/collection/:collectionSlug", id: "StockCars(collection)" },
  { path: "/stock-cars/:makeSlug", id: "StockCars(make)" },
  { path: "/stock-cars/:makeSlug/:modelSlug", id: "StockCars(model)" },
  { path: "/stock-cars/:makeSlug/:modelSlug/:id", id: "CarDetail" },
  { path: "/search", id: "Search" },
  { path: "/auctions", id: "Auctions" },
  { path: "/resources", id: "Resources" },
  { path: "/faq", id: "Faq" },
  { path: "/about-us", id: "AboutUs" },
  { path: "/inquiry", id: "Inquiry" },
  { path: "*", id: "NotFound" },
];

const cases = [
  ["/", "Index"],
  ["/stock-cars", "StockCars(all)"],
  ["/stock-cars/toyota", "StockCars(make)"],
  ["/stock-cars/toyota/land-cruiser-prado", "StockCars(model)"],
  ["/stock-cars/toyota/land-cruiser-prado/NEO-1042", "CarDetail"],
  ["/stock-cars/collection/jdm-sports-cars", "StockCars(collection)"],
  ["/stock-cars/collection", "StockCars(make)"], // "collection" alone falls through to make
  ["/search", "Search"],
  ["/auctions", "Auctions"],
  ["/faq", "Faq"],
  ["/resources", "Resources"],
  ["/about-us", "AboutUs"],
  ["/inquiry", "Inquiry"],
  ["/nope", "NotFound"],
];

let failed = 0;
for (const [path, expected] of cases) {
  const m = matchRoutes(routes, path);
  const got = m ? m[m.length - 1].route.id : "NO MATCH";
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${path.padEnd(48)} -> ${got}${ok ? "" : `  (expected ${expected})`}`);
}
console.log(failed === 0 ? "\nAll route matches correct." : `\n${failed} FAILURES`);
process.exit(failed ? 1 : 0);
