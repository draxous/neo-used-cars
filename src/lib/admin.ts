/**
 * Admin access and the inbox data behind /admin.
 *
 * Nothing here is a security boundary — the route guard only decides what to
 * render. Access is enforced by the row-level security policies in
 * supabase/schema.sql, so a non-admin who forces their way to /admin sees
 * empty lists and gets errors on write.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const quoteStatuses = ["new", "open", "quoted", "closed"];
export const messageStatuses = ["new", "open", "answered", "closed"];

export interface AdminQuote {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  make: string;
  model: string;
  yearRange: string;
  budget: string;
  message: string | null;
  status: string;
  userId: string | null;
}

export interface AdminOrderMessage {
  id: string;
  createdAt: string;
  orderId: string;
  carId: string | null;
  carLabel: string | null;
  topic: string;
  message: string;
  status: string;
  customerName: string;
  customerEmail: string;
}

export type AdminRole = "super_admin" | "admin" | "staff";

/**
 * The signed-in account's role, once confirmed. `isSuperAdmin` is the extra
 * bit /admin/team needs — inviting is the one thing an ordinary admin can't do.
 */
export const useIsAdmin = () => {
  const { user, ready } = useAuth();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!ready) return;

    if (!user || !supabase) {
      setRole(null);
      setChecked(true);
      return;
    }

    let cancelled = false;

    // The "can read own role" policy makes this return a row only for admins.
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setRole((data?.role as AdminRole) ?? null);
        setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user, ready]);

  return {
    role,
    isAdmin: role !== null,
    isSuperAdmin: role === "super_admin",
    checked: checked && ready,
  };
};

/* ------------------------------------------------------------------ */
/* Quote requests                                                      */
/* ------------------------------------------------------------------ */

export const listQuotes = async (): Promise<AdminQuote[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    make: row.make,
    model: row.model,
    yearRange: row.year_range,
    budget: row.budget,
    message: row.message,
    status: row.status,
    userId: row.user_id,
  }));
};

export const setQuoteStatus = async (id: string, status: string) => {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
  if (error) throw error;
};

/* ------------------------------------------------------------------ */
/* Order messages                                                      */
/* ------------------------------------------------------------------ */

/** Goes through an RPC so the customer's live email can be joined in. */
export const listOrderMessagesForAdmin = async (): Promise<AdminOrderMessage[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("admin_order_messages");
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    orderId: row.order_id,
    carId: row.car_id,
    carLabel: row.car_label,
    topic: row.topic,
    message: row.message,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
  }));
};

export const setMessageStatus = async (id: string, status: string) => {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("order_messages").update({ status }).eq("id", id);
  if (error) throw error;
};
