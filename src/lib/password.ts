import * as z from "zod";

/** Shown live under password fields so the rules aren't a guessing game. */
export const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "One letter", test: (value: string) => /[a-zA-Z]/.test(value) },
  { label: "One number", test: (value: string) => /\d/.test(value) },
];

/** Same requirement wherever a password is chosen: sign-up and reset. */
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[a-zA-Z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const strengthLabels = ["Too short", "Weak", "Good", "Strong"];
