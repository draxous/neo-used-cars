/**
 * "Get a Quote" submissions.
 *
 * The table is write-only through the public API — see supabase/schema.sql.
 * Submissions are read in the Supabase dashboard, except by the customer who
 * sent them.
 */
import { supabase } from "@/lib/supabase";

export interface QuoteRequest {
  name: string;
  email: string;
  country: string;
  vehicle?: string;
  budget?: string;
  message?: string;
}

/** Empty optional fields are stored as null rather than "". */
const orNull = (value?: string) => value?.trim() || null;

/**
 * Saves a quote request, linking it to the account when one is signed in.
 * Throws if the row could not be written, so the caller can fall back.
 */
export const saveQuoteRequest = async (values: QuoteRequest, userId: string | null) => {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.from("quotes").insert({
    name: values.name.trim(),
    email: values.email.trim(),
    country: values.country,
    vehicle: orNull(values.vehicle),
    budget: orNull(values.budget),
    message: orNull(values.message),
    user_id: userId,
  });

  if (error) throw error;
};
