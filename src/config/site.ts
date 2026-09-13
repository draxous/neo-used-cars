/**
 * Central place for contact details and third-party keys.
 * Update these in one spot rather than hunting through components.
 */
export const siteConfig = {
  name: "Neo",
  tagline: "The Japanese Used Car Exporter",
  email: "neollcjp@gmail.com",
  phone: "+81-80-9718-5080",
  /** Digits only — used for tel: and WhatsApp links. */
  phoneRaw: "818097185080",
  address: "Neo LLC, Higashikomatsugawa 1-12-1, Edogawa, Tokyo",
  /**
   * Free access key from https://web3forms.com (enter your email, they send it).
   * Put it in a .env file as VITE_WEB3FORMS_ACCESS_KEY=your-key-here
   * Without it, inquiry forms fall back to opening the visitor's email client.
   */
  web3formsKey: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? "",
} as const;

/** Top destination markets for Japanese used vehicle exports. */
export const countries = [
  "Australia", "Bahamas", "Bangladesh", "Bolivia", "Botswana", "Chile",
  "Cyprus", "DR Congo", "Fiji", "Georgia", "Guyana", "Ireland", "Jamaica",
  "Kenya", "Malawi", "Mauritius", "Mongolia", "Mozambique", "Myanmar",
  "Nepal", "New Zealand", "Pakistan", "Papua New Guinea", "Paraguay", "Peru",
  "Philippines", "Russia", "South Africa", "Sri Lanka", "Tanzania",
  "Trinidad & Tobago", "UAE", "Uganda", "United Kingdom", "Zambia",
  "Zimbabwe", "Other",
];

export const budgetRanges = [
  "Under $5,000",
  "$5,000 - $10,000",
  "$10,000 - $20,000",
  "$20,000 - $30,000",
  "Over $30,000",
];
