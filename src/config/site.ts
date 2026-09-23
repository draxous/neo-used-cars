/**
 * Central place for contact details and third-party keys.
 * Update these in one spot rather than hunting through components.
 *
 * The contact details and announcement below are only defaults: src/bootstrap.ts
 * overwrites them from the `site_settings` table before the first render, and
 * the team edits that row at /admin/settings.
 */
export interface SiteConfig {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  /** Digits only — used for tel: and WhatsApp links. */
  phoneRaw: string;
  address: string;
  /** Shown in a bar above the header when set. Empty means no bar. */
  announcement: string;
  /**
   * Free access key from https://web3forms.com (enter your email, they send it).
   * Put it in a .env file as VITE_WEB3FORMS_ACCESS_KEY=your-key-here
   * Without it, inquiry forms fall back to opening the visitor's email client.
   */
  web3formsKey: string;
}

export const siteConfig: SiteConfig = {
  name: "Neo",
  tagline: "The Japanese Used Car Exporter",
  email: "neollcjp@gmail.com",
  phone: "+81-80-9718-5080",
  phoneRaw: "818097185080",
  address: "Neo LLC, Higashikomatsugawa 1-12-1, Edogawa, Tokyo",
  announcement: "",
  web3formsKey: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? "",
};

/** Top destination markets for Japanese used vehicle exports. */
export const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "New Zealand",
  "Bahamas", "Bangladesh", "Bolivia", "Botswana", "Chile",
  "Cyprus", "DR Congo", "Fiji", "Georgia", "Guyana", "Ireland", "Jamaica",
  "Kenya", "Malawi", "Mauritius", "Mongolia", "Mozambique", "Myanmar",
  "Nepal", "Pakistan", "Papua New Guinea", "Paraguay", "Peru",
  "Philippines", "Russia", "South Africa", "Sri Lanka", "Tanzania",
  "Trinidad & Tobago", "UAE", "Uganda", "Zambia",
  "Zimbabwe", "Other",
];

/** Age bands for the inquiry form — how buyers actually think about it. */
export const yearRanges = [
  "2021 or newer",
  "2016 - 2020",
  "2011 - 2015",
  "2006 - 2010",
  "2005 or older",
  "No preference",
];

/**
 * Dial codes for the phone field. Japan first (that's where we ship from),
 * then the destination markets, so the common picks are at the top.
 */
export interface PhoneCountry {
  name: string;
  dial: string;
  flag: string;
}

export const phoneCountries: PhoneCountry[] = [
  { name: "Japan", dial: "+81", flag: "\u{1F1EF}\u{1F1F5}" },
  { name: "Australia", dial: "+61", flag: "\u{1F1E6}\u{1F1FA}" },
  { name: "Bahamas", dial: "+1242", flag: "\u{1F1E7}\u{1F1F8}" },
  { name: "Bangladesh", dial: "+880", flag: "\u{1F1E7}\u{1F1E9}" },
  { name: "Bolivia", dial: "+591", flag: "\u{1F1E7}\u{1F1F4}" },
  { name: "Botswana", dial: "+267", flag: "\u{1F1E7}\u{1F1FC}" },
  { name: "Canada", dial: "+1", flag: "\u{1F1E8}\u{1F1E6}" },
  { name: "Chile", dial: "+56", flag: "\u{1F1E8}\u{1F1F1}" },
  { name: "Cyprus", dial: "+357", flag: "\u{1F1E8}\u{1F1FE}" },
  { name: "DR Congo", dial: "+243", flag: "\u{1F1E8}\u{1F1E9}" },
  { name: "Fiji", dial: "+679", flag: "\u{1F1EB}\u{1F1EF}" },
  { name: "Georgia", dial: "+995", flag: "\u{1F1EC}\u{1F1EA}" },
  { name: "Guyana", dial: "+592", flag: "\u{1F1EC}\u{1F1FE}" },
  { name: "Ireland", dial: "+353", flag: "\u{1F1EE}\u{1F1EA}" },
  { name: "Jamaica", dial: "+1876", flag: "\u{1F1EF}\u{1F1F2}" },
  { name: "Kenya", dial: "+254", flag: "\u{1F1F0}\u{1F1EA}" },
  { name: "Malawi", dial: "+265", flag: "\u{1F1F2}\u{1F1FC}" },
  { name: "Mauritius", dial: "+230", flag: "\u{1F1F2}\u{1F1FA}" },
  { name: "Mongolia", dial: "+976", flag: "\u{1F1F2}\u{1F1F3}" },
  { name: "Mozambique", dial: "+258", flag: "\u{1F1F2}\u{1F1FF}" },
  { name: "Myanmar", dial: "+95", flag: "\u{1F1F2}\u{1F1F2}" },
  { name: "Nepal", dial: "+977", flag: "\u{1F1F3}\u{1F1F5}" },
  { name: "New Zealand", dial: "+64", flag: "\u{1F1F3}\u{1F1FF}" },
  { name: "Pakistan", dial: "+92", flag: "\u{1F1F5}\u{1F1F0}" },
  { name: "Papua New Guinea", dial: "+675", flag: "\u{1F1F5}\u{1F1EC}" },
  { name: "Paraguay", dial: "+595", flag: "\u{1F1F5}\u{1F1FE}" },
  { name: "Peru", dial: "+51", flag: "\u{1F1F5}\u{1F1EA}" },
  { name: "Philippines", dial: "+63", flag: "\u{1F1F5}\u{1F1ED}" },
  { name: "Russia", dial: "+7", flag: "\u{1F1F7}\u{1F1FA}" },
  { name: "South Africa", dial: "+27", flag: "\u{1F1FF}\u{1F1E6}" },
  { name: "Sri Lanka", dial: "+94", flag: "\u{1F1F1}\u{1F1F0}" },
  { name: "Tanzania", dial: "+255", flag: "\u{1F1F9}\u{1F1FF}" },
  { name: "Trinidad & Tobago", dial: "+1868", flag: "\u{1F1F9}\u{1F1F9}" },
  { name: "UAE", dial: "+971", flag: "\u{1F1E6}\u{1F1EA}" },
  { name: "Uganda", dial: "+256", flag: "\u{1F1FA}\u{1F1EC}" },
  { name: "United Kingdom", dial: "+44", flag: "\u{1F1EC}\u{1F1E7}" },
  { name: "United States", dial: "+1", flag: "\u{1F1FA}\u{1F1F8}" },
  { name: "Zambia", dial: "+260", flag: "\u{1F1FF}\u{1F1F2}" },
  { name: "Zimbabwe", dial: "+263", flag: "\u{1F1FF}\u{1F1FC}" },
];

export const budgetRanges = [
  "Under $5,000",
  "$5,000 - $10,000",
  "$10,000 - $20,000",
  "$20,000 - $30,000",
  "Over $30,000",
];
