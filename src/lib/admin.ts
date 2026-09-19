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
 * The signed-in account's role, once confirmed. `isManager` (admin and up) is
 * what deleting and site settings need; `isSuperAdmin` is the extra bit
 * /admin/team needs — inviting is the one thing an ordinary admin can't do.
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
    isManager: role === "super_admin" || role === "admin",
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

/** For spam. Managers only — RLS reports a refusal as zero rows. */
export const deleteQuote = async (id: string) => {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error, count } = await supabase.from("quotes").delete({ count: "exact" }).eq("id", id);
  if (error) throw error;
  if (count === 0) throw new Error("Only an admin or super admin can delete requests.");
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

export const deleteOrderMessage = async (id: string) => {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error, count } = await supabase
    .from("order_messages")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  if (count === 0) throw new Error("Only an admin or super admin can delete messages.");
};

/* ------------------------------------------------------------------ */
/* Replies                                                             */
/* ------------------------------------------------------------------ */

export interface InquiryReply {
  id: string;
  createdAt: string;
  quoteId: string | null;
  messageId: string | null;
  body: string;
  authorName: string;
}

/** Every reply, oldest first, with who wrote it. Grouped by the caller. */
export const listReplies = async (): Promise<InquiryReply[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("admin_inquiry_replies");
  if (error) throw error;

  return (data ?? []).map((row: Record<string, string | null>) => ({
    id: row.id as string,
    createdAt: row.created_at as string,
    quoteId: row.quote_id,
    messageId: row.message_id,
    body: row.body as string,
    authorName: row.author_name ?? "",
  }));
};

/**
 * Records a reply. The database then moves the thread along — a message to
 * "answered", a new quote to "open" (see after_inquiry_reply in schema.sql).
 */
export const sendReply = async (
  target: { quoteId: string } | { messageId: string },
  body: string,
  authorId: string
) => {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("inquiry_replies").insert({
    quote_id: "quoteId" in target ? target.quoteId : null,
    message_id: "messageId" in target ? target.messageId : null,
    body: body.trim(),
    author_id: authorId,
  });
  if (error) throw error;
};

/** Groups replies under the id of the quote or message they answer. */
export const groupReplies = (replies: InquiryReply[]): Map<string, InquiryReply[]> => {
  const groups = new Map<string, InquiryReply[]>();
  replies.forEach((reply) => {
    const key = reply.quoteId ?? reply.messageId;
    if (!key) return;
    groups.set(key, [...(groups.get(key) ?? []), reply]);
  });
  return groups;
};

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

export interface AdminCustomer {
  userId: string;
  email: string;
  name: string;
  country: string;
  phone: string | null;
  company: string | null;
  createdAt: string;
  lastSignIn: string | null;
  emailVerified: boolean;
  orderCount: number;
  quoteCount: number;
  /** Set when the account is also on the admin team. */
  teamRole: AdminRole | null;
}

export const listCustomers = async (): Promise<AdminCustomer[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("admin_list_customers");
  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    userId: row.user_id as string,
    email: (row.email as string) ?? "",
    name: (row.name as string) ?? "",
    country: (row.country as string) ?? "",
    phone: (row.phone as string) ?? null,
    company: (row.company as string) ?? null,
    createdAt: row.created_at as string,
    lastSignIn: (row.last_sign_in as string) ?? null,
    emailVerified: Boolean(row.email_verified),
    orderCount: Number(row.order_count ?? 0),
    quoteCount: Number(row.quote_count ?? 0),
    teamRole: (row.team_role as AdminRole) ?? null,
  }));
};

/**
 * A mailto: link with the reply already written, for customers who only reach
 * us by email. The site has no mail server, so the admin's own client sends it.
 */
export const replyMailto = (to: string, subject: string, body: string): string =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/* ------------------------------------------------------------------ */
/* Your own account                                                    */
/* ------------------------------------------------------------------ */

/**
 * Updates the signed-in person's name and phone in both places they live: the
 * auth record (what the header greets you with) and profiles (what the team
 * sees next to your replies).
 */
export const updateOwnProfile = async (userId: string, values: { name: string; phone: string }) => {
  if (!supabase) throw new Error("Supabase is not configured");

  const name = values.name.trim();
  const phone = values.phone.trim() || null;

  const { error: authError } = await supabase.auth.updateUser({ data: { name, phone } });
  if (authError) throw new Error(authError.message);

  const { error } = await supabase.from("profiles").update({ name, phone }).eq("id", userId);
  if (error) throw new Error(error.message);
};
