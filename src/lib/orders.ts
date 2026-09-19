/**
 * Vehicle orders — what a customer sees on My Vehicles and the team moves
 * along on /admin/orders.
 *
 * Customers can only read their own (RLS); every write is the team's. Stage
 * changes go through `admin_set_order_stage` so the tracker and the timeline
 * underneath it are written together and can't disagree.
 */
import { supabase } from "@/lib/supabase";
import { Purchase, ShipmentStage } from "@/lib/userData";

type OrderRow = {
  id: string;
  user_id: string;
  car_id: string | null;
  car_label: string;
  purchased_at: string;
  price_paid_usd: number;
  stage: ShipmentStage;
  destination: string;
  vessel: string | null;
  eta_date: string | null;
};

type UpdateRow = {
  id: string;
  order_id: string;
  at: string;
  label: string;
  stage: ShipmentStage | null;
};

export interface OrderUpdate {
  id: string;
  at: string;
  label: string;
  stage: ShipmentStage | null;
}

export interface AdminOrder extends Purchase {
  userId: string;
  customerName: string;
  customerEmail: string;
}

/**
 * What a stage change says when nobody types anything. Mirrors
 * order_stage_label() in supabase/schema.sql — change both together.
 */
export const defaultStageLabels: Record<ShipmentStage, string> = {
  purchased: "Payment received — unit secured",
  inspected: "Pre-export inspection passed",
  booked: "Space booked on a vessel",
  shipped: "Departed Japan",
  arrived: "Arrived at destination port",
};

const client = () => {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
};

const toPurchase = (row: OrderRow, updates: UpdateRow[]): Purchase => ({
  id: row.id,
  carId: row.car_id ?? "",
  carLabel: row.car_label,
  purchasedAt: row.purchased_at,
  pricePaidUsd: row.price_paid_usd,
  stage: row.stage,
  destination: row.destination,
  vessel: row.vessel ?? undefined,
  etaDate: row.eta_date ?? undefined,
  updates: updates
    .filter((update) => update.order_id === row.id)
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((update) => ({ at: update.at, label: update.label })),
});

/* ------------------------------------------------------------------ */
/* Customer                                                            */
/* ------------------------------------------------------------------ */

/** The signed-in customer's orders with their timelines, newest first. */
export const listMyOrders = async (userId: string): Promise<Purchase[]> => {
  if (!supabase) return [];

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, user_id, car_id, car_label, purchased_at, price_paid_usd, stage, destination, vessel, eta_date")
    .eq("user_id", userId)
    .order("purchased_at", { ascending: false });

  if (error) throw error;
  if (!orders?.length) return [];

  const { data: updates, error: updatesError } = await supabase
    .from("order_updates")
    .select("id, order_id, at, label, stage")
    .in("order_id", orders.map((order) => order.id));

  if (updatesError) throw updatesError;

  return (orders as OrderRow[]).map((row) => toPurchase(row, (updates ?? []) as UpdateRow[]));
};

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export const listOrdersForAdmin = async (): Promise<AdminOrder[]> => {
  const { data, error } = await client().rpc("admin_list_orders");
  if (error) throw new Error(error.message);

  return ((data ?? []) as (OrderRow & { customer_name: string; customer_email: string })[]).map(
    (row) => ({
      ...toPurchase(row, []),
      userId: row.user_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email ?? "",
    })
  );
};

/** One order's timeline, newest first — loaded when its panel opens. */
export const listOrderUpdates = async (orderId: string): Promise<OrderUpdate[]> => {
  const { data, error } = await client()
    .from("order_updates")
    .select("id, order_id, at, label, stage")
    .eq("order_id", orderId)
    .order("at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as UpdateRow[]).map(({ id, at, label, stage }) => ({ id, at, label, stage }));
};

export interface NewOrder {
  userId: string;
  carId: string;
  carLabel: string;
  priceUsd: number;
  destination: string;
  purchasedAt: string;
  markSold: boolean;
}

/** Creates the order and its first timeline line. Returns the order number. */
export const createOrder = async (order: NewOrder): Promise<string> => {
  const { data, error } = await client().rpc("admin_create_order", {
    p_user_id: order.userId,
    p_car_id: order.carId,
    p_car_label: order.carLabel.trim(),
    p_price: order.priceUsd,
    p_destination: order.destination.trim(),
    p_purchased: order.purchasedAt,
    p_mark_sold: order.markSold,
  });
  if (error) throw new Error(error.message);
  return data as string;
};

/** Moves the order to a stage; a blank label uses the standard wording. */
export const setOrderStage = async (
  orderId: string,
  stage: ShipmentStage,
  label?: string
): Promise<void> => {
  const { error } = await client().rpc("admin_set_order_stage", {
    p_order_id: orderId,
    p_stage: stage,
    p_label: label?.trim() || null,
  });
  if (error) throw new Error(error.message);
};

/** Shipping details that change without the stage moving. */
export const updateOrderDetails = async (
  orderId: string,
  details: { destination: string; vessel: string; etaDate: string; pricePaidUsd: number }
): Promise<void> => {
  const { error } = await client()
    .from("orders")
    .update({
      destination: details.destination.trim(),
      vessel: details.vessel.trim() || null,
      eta_date: details.etaDate || null,
      price_paid_usd: details.pricePaidUsd,
    })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
};

/** A free-text line on the timeline, e.g. "B/L sent by courier". */
export const addOrderNote = async (orderId: string, label: string): Promise<void> => {
  const { error } = await client()
    .from("order_updates")
    .insert({ order_id: orderId, label: label.trim() });
  if (error) throw new Error(error.message);
};

export const removeOrderUpdate = async (id: string): Promise<void> => {
  const { error } = await client().from("order_updates").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  const { error, count } = await client()
    .from("orders")
    .delete({ count: "exact" })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("Only an admin or super admin can delete orders.");
};
