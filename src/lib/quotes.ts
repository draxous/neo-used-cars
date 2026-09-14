/**
 * "Get a Quote" submissions.
 *
 * The table is write-only through the public API — see supabase/schema.sql.
 * Submissions are read in the Supabase dashboard, except by the customer who
 * sent them.
 */
import { supabase } from "@/lib/supabase";

export interface QuoteRequest {
  firstName: string;
  lastName: string;
  email: string;
  /** Dial code included, e.g. "+81 3 1234 5678". */
  phone: string;
  country: string;
  make: string;
  model: string;
  yearRange: string;
  budget: string;
  message?: string;
}

/**
 * Saves a quote request, linking it to the account when one is signed in.
 * Throws if the row could not be written, so the caller can fall back.
 */
export const saveQuoteRequest = async (values: QuoteRequest, userId: string | null) => {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.from("quotes").insert({
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    country: values.country,
    make: values.make.trim(),
    model: values.model.trim(),
    year_range: values.yearRange,
    budget: values.budget,
    // An empty message is stored as null rather than "".
    message: values.message?.trim() || null,
    user_id: userId,
  });

  if (error) throw error;
};
