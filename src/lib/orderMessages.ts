/**
 * "Ask about this order" — questions a customer sends about a vehicle they
 * bought. See supabase/schema.sql: a customer can only write as themselves and
 * only read their own messages back.
 */
import { supabase } from "@/lib/supabase";

/** What a customer is asking about, so the admin panel can triage. */
export const messageTopics = [
  "Shipping status",
  "Estimated arrival",
  "Documents",
  "Payment",
  "Delivery to port",
  "Something else",
];

export interface OrderMessageDraft {
  orderId: string;
  carId?: string;
  /** Plain-text snapshot, e.g. "2020 Toyota Land Cruiser Prado". */
  carLabel?: string;
  topic: string;
  message: string;
}

/** An answer from the team, shown under the question it replies to. */
export interface OrderMessageReply {
  id: string;
  createdAt: string;
  body: string;
}

export interface OrderMessage {
  id: string;
  createdAt: string;
  topic: string;
  message: string;
  status: string;
  replies: OrderMessageReply[];
}

/** Sends a question. Throws so the caller can show the failure. */
export const sendOrderMessage = async (draft: OrderMessageDraft, userId: string) => {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.from("order_messages").insert({
    user_id: userId,
    order_id: draft.orderId,
    car_id: draft.carId ?? null,
    car_label: draft.carLabel ?? null,
    topic: draft.topic,
    message: draft.message.trim(),
  });

  if (error) throw error;
};

/** Everything this customer has asked about one order, with our replies, newest last. */
export const listOrderMessages = async (orderId: string): Promise<OrderMessage[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("order_messages")
    .select("id, created_at, topic, message, status")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!data?.length) return [];

  // RLS lets a customer read replies only to their own messages.
  const { data: replies } = await supabase
    .from("inquiry_replies")
    .select("id, created_at, message_id, body")
    .in("message_id", data.map((row) => row.id))
    .order("created_at", { ascending: true });

  return data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    topic: row.topic,
    message: row.message,
    status: row.status,
    replies: (replies ?? [])
      .filter((reply) => reply.message_id === row.id)
      .map((reply) => ({ id: reply.id, createdAt: reply.created_at, body: reply.body })),
  }));
};
