/**
 * Admin invitations — the separate way into /admin.
 *
 * A super admin issues an invitation on /admin/team and passes the one-time
 * link on by hand; the invited person opens /admin/join, where the address is
 * fixed by the invitation and only a password is asked for. None of this goes
 * through /register, and no account can grant itself a role: every call here
 * lands on a SECURITY DEFINER function in supabase/schema.sql that re-checks
 * who is asking, so the browser is never the thing being trusted.
 *
 * The raw token exists in one place only — the link. The database keeps its
 * sha256, so nothing readable here can be replayed as an invitation.
 */
import { supabase } from "@/lib/supabase";
import type { AdminRole } from "@/lib/admin";

/** Roles a super admin may hand out. Their own is granted in SQL, once. */
export const invitableRoles = ["admin", "staff"] as const;
export type InvitableRole = (typeof invitableRoles)[number];

export interface AdminInvite {
  id: string;
  createdAt: string;
  email: string;
  role: InvitableRole;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  invitedBy: string;
}

export interface TeamMember {
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
  grantedAt: string;
}

/** What the invited person is shown before they have an account. */
export interface InviteDetails {
  email: string;
  role: InvitableRole;
  expiresAt: string;
}

const client = () => {
  if (!supabase) throw new Error("Accounts aren't connected yet.");
  return supabase;
};

/**
 * Postgres speaks in `raise exception`; the messages there are already written
 * for people, so pass them through rather than inventing a second wording.
 */
const describe = (error: { message?: string } | null, fallback: string): string => {
  const message = error?.message?.trim();
  if (!message) return fallback;
  // PostgREST prefixes nothing useful, but pg does wrap some in quotes.
  return message.replace(/^error:\s*/i, "");
};

/* ------------------------------------------------------------------ */
/* Issuing (super admin)                                               */
/* ------------------------------------------------------------------ */

/**
 * Returns the raw token exactly once — it is not recoverable afterwards, so
 * the caller must show it now or issue a fresh invitation later.
 */
export const createAdminInvite = async (
  email: string,
  role: InvitableRole
): Promise<{ token: string; expiresAt: string }> => {
  const { data, error } = await client()
    .rpc("create_admin_invite", { p_email: email.trim(), p_role: role })
    .maybeSingle();

  if (error) throw new Error(describe(error, "Couldn't create that invitation."));

  const row = data as { token: string; expires_at: string } | null;
  if (!row) throw new Error("Couldn't create that invitation.");

  return { token: row.token, expiresAt: row.expires_at };
};

export const listAdminInvites = async (): Promise<AdminInvite[]> => {
  const { data, error } = await client().rpc("list_admin_invites");
  if (error) throw new Error(describe(error, "Couldn't load invitations."));

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    createdAt: row.created_at as string,
    email: row.email as string,
    role: row.role as InvitableRole,
    expiresAt: row.expires_at as string,
    acceptedAt: (row.accepted_at as string) ?? null,
    revokedAt: (row.revoked_at as string) ?? null,
    invitedBy: (row.invited_by as string) ?? "",
  }));
};

export const revokeAdminInvite = async (id: string): Promise<void> => {
  const { error } = await client().rpc("revoke_admin_invite", { p_id: id });
  if (error) throw new Error(describe(error, "Couldn't revoke that invitation."));
};

/* ------------------------------------------------------------------ */
/* The team itself (super admin)                                       */
/* ------------------------------------------------------------------ */

export const listAdminTeam = async (): Promise<TeamMember[]> => {
  const { data, error } = await client().rpc("list_admin_team");
  if (error) throw new Error(describe(error, "Couldn't load the team."));

  return (data ?? []).map((row: Record<string, unknown>) => ({
    userId: row.user_id as string,
    email: row.email as string,
    name: row.name as string,
    role: row.role as AdminRole,
    grantedAt: row.granted_at as string,
  }));
};

/** Removes the role, not the account: they keep signing in as a customer. */
export const revokeAdminRole = async (userId: string): Promise<void> => {
  const { error } = await client().rpc("revoke_admin_role", { p_user_id: userId });
  if (error) throw new Error(describe(error, "Couldn't remove that person."));
};

/** Promotes or demotes someone already on the team. Not yourself. */
export const setAdminRole = async (userId: string, role: AdminRole): Promise<void> => {
  const { error } = await client().rpc("set_admin_role", { p_user_id: userId, p_role: role });
  if (error) throw new Error(describe(error, "Couldn't change that role."));
};

/* ------------------------------------------------------------------ */
/* Redeeming (the invited person)                                      */
/* ------------------------------------------------------------------ */

/**
 * Open to signed-out visitors by design — it is what the join page renders
 * before an account exists. Nothing comes back without the token.
 */
export const lookupAdminInvite = async (token: string): Promise<InviteDetails | null> => {
  const { data, error } = await client()
    .rpc("admin_invite_details", { p_token: token })
    .maybeSingle();

  if (error) throw new Error(describe(error, "Couldn't check that invitation."));

  const row = data as { email: string; role: InvitableRole; expires_at: string } | null;
  if (!row) return null;

  return { email: row.email, role: row.role, expiresAt: row.expires_at };
};

/**
 * Grants the role. Requires a session whose confirmed address matches the
 * invited one, which is what stops a forwarded link being redeemed by whoever
 * happens to receive it.
 */
export const acceptAdminInvite = async (token: string): Promise<AdminRole> => {
  const { data, error } = await client().rpc("accept_admin_invite", { p_token: token });
  if (error) throw new Error(describe(error, "Couldn't accept that invitation."));
  return data as AdminRole;
};

/** "admin" -> "Admin", for labels. */
export const roleLabel = (role: AdminRole | InvitableRole): string =>
  ({ super_admin: "Super admin", admin: "Admin", staff: "Staff" })[role] ?? role;

/** The link a super admin copies out of /admin/team. */
export const inviteLink = (token: string): string =>
  `${window.location.origin}/admin/join?token=${encodeURIComponent(token)}`;
