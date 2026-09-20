/**
 * Buy, bid and service requests made from a vehicle page by a signed-in
 * customer. Signed-out visitors still use the inquiry form, which writes to
 * `quotes`; everything here carries an account, so the team knows who asked.
 *
 * Nothing is charged: a request tells the team to follow up. See
 * supabase/schema.sql — a customer writes and reads only their own.
 */
import { supabase } from "@/lib/supabase";

export type RequestKind = "buy" | "bid" | "translation" | "inspection" | "inquiry";

export const requestStatuses = ["new", "open", "done", "closed"];

/** How each kind reads in the admin list and in the customer's confirmation. */
export const requestLabels: Record<RequestKind, string> = {
  buy: "Buy it now",
  bid: "Bid",
  translation: "Translation",
  inspection: "Inspection",
  inquiry: "Question",
};

export interface CarRequest {
  id: string;
  createdAt: string;
  carId: string | null;
  carLabel: string;
  kind: RequestKind;
  maxBidUsd: number | null;
  message: string | null;
  status: string;
}

export interface AdminCarRequest extends CarRequest {
  userId: string;
  customerName: string;
  customerEmail: string;
}

export interface CarRequestDraft {
  carId: string;
  carLabel: string;
  kind: RequestKind;
  maxBidUsd?: number;
  message?: string;
}

const client = () => {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
};

type Row = {
  id: string;
  created_at: string;
  car_id: string | null;
  car_label: string;
  kind: RequestKind;
  max_bid_usd: number | null;
  message: string | null;
  status: string;
};

const fromRow = (row: Row): CarRequest => ({
  id: row.id,
  createdAt: row.created_at,
  carId: row.car_id,
  carLabel: row.car_label,
  kind: row.kind,
  maxBidUsd: row.max_bid_usd,
  message: row.message,
  status: row.status,
});

export const sendCarRequest = async (draft: CarRequestDraft, userId: string): Promise<void> => {
  const { error } = await client().from("car_requests").insert({
    user_id: userId,
    car_id: draft.carId,
    car_label: draft.carLabel,
    kind: draft.kind,
    max_bid_usd: draft.maxBidUsd ?? null,
    message: draft.message?.trim() || null,
  });
  if (error) throw new Error(error.message);
};

/** What this customer has already asked about one car, newest first. */
export const listMyCarRequests = async (carId: string): Promise<CarRequest[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("car_requests")
    .select("id, created_at, car_id, car_label, kind, max_bid_usd, message, status")
    .eq("car_id", carId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as Row[]).map(fromRow);
};

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export const listCarRequestsForAdmin = async (): Promise<AdminCarRequest[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("admin_car_requests");
  if (error) throw error;

  return ((data ?? []) as (Row & { user_id: string; customer_name: string; customer_email: string })[]).map(
    (row) => ({
      ...fromRow(row),
      userId: row.user_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email ?? "",
    })
  );
};

export const setCarRequestStatus = async (id: string, status: string): Promise<void> => {
  const { error } = await client().from("car_requests").update({ status }).eq("id", id);
  if (error) throw error;
};

export const deleteCarRequest = async (id: string): Promise<void> => {
  const { error, count } = await client()
    .from("car_requests")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  if (count === 0) throw new Error("Only an admin or super admin can delete requests.");
};
