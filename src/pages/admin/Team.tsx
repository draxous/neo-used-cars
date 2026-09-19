import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth";
import { AdminRole, useIsAdmin } from "@/lib/admin";
import {
  AdminInvite,
  InvitableRole,
  TeamMember,
  createAdminInvite,
  inviteLink,
  invitableRoles,
  listAdminInvites,
  listAdminTeam,
  revokeAdminInvite,
  revokeAdminRole,
  roleLabel,
  setAdminRole,
} from "@/lib/adminInvites";
import { formatDate } from "@/lib/userData";

const allRoles: AdminRole[] = ["super_admin", "admin", "staff"];

/** Pending / accepted / revoked / expired, for the badge beside an invite. */
const inviteState = (invite: AdminInvite) => {
  if (invite.acceptedAt) return { label: "Accepted", variant: "secondary" as const };
  if (invite.revokedAt) return { label: "Revoked", variant: "outline" as const };
  if (new Date(invite.expiresAt) < new Date()) {
    return { label: "Expired", variant: "outline" as const };
  }
  return { label: "Pending", variant: "default" as const };
};

const Team = () => {
  const { user } = useAuth();
  const { isSuperAdmin, checked } = useIsAdmin();

  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitableRole>("admin");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // The token comes back once and is never stored, so this link lives here
  // until the page is left. Losing it means issuing a fresh invitation.
  const [freshLink, setFreshLink] = useState<{ email: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextInvites, nextTeam] = await Promise.all([listAdminInvites(), listAdminTeam()]);
      setInvites(nextInvites);
      setTeam(nextTeam);
    } catch {
      setError("Couldn't load the team. Check the database connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) void load();
  }, [isSuperAdmin, load]);

  if (checked && !isSuperAdmin) return <Navigate to="/admin/quotes" replace />;

  const onChangeRole = async (member: TeamMember, next: AdminRole) => {
    const before = team;
    setTeam((current) =>
      current.map((item) => (item.userId === member.userId ? { ...item, role: next } : item))
    );
    try {
      await setAdminRole(member.userId, next);
      toast.success(`${member.name || member.email} is now ${roleLabel(next).toLowerCase()}.`);
    } catch (issue) {
      setTeam(before);
      toast.error(issue instanceof Error ? issue.message : "Couldn't change that role.");
    }
  };

  const onInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSending(true);
    try {
      const { token } = await createAdminInvite(email, role);
      setFreshLink({ email: email.trim().toLowerCase(), url: inviteLink(token) });
      setCopied(false);
      setEmail("");
      toast.success("Invitation created — copy the link below.");
      void load();
    } catch (issue) {
      setFormError(issue instanceof Error ? issue.message : "Couldn't create that invitation.");
    } finally {
      setSending(false);
    }
  };

  const onCopy = async () => {
    if (!freshLink) return;
    try {
      await navigator.clipboard.writeText(freshLink.url);
      setCopied(true);
      toast.success("Link copied.");
    } catch {
      toast.error("Couldn't copy — select the link and copy it by hand.");
    }
  };

  const onRevoke = async (invite: AdminInvite) => {
    try {
      await revokeAdminInvite(invite.id);
      toast.success(`Invitation to ${invite.email} revoked.`);
      void load();
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Couldn't revoke that invitation.");
    }
  };

  const onRemove = async () => {
    if (!removing) return;
    const member = removing;
    setRemoving(null);
    try {
      await revokeAdminRole(member.userId);
      toast.success(`${member.email} no longer has admin access.`);
      void load();
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Couldn't remove that person.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Admin <span className="text-primary">team</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Invite someone to the panel and pass the link on yourself. It works once, for that
          address only.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Invite -------------------------------------------------------- */}
      <section className="bg-card rounded-lg card-shadow p-4">
        <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          Invite someone
        </h2>

        <form onSubmit={onInvite} noValidate className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[15rem]">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="colleague@example.com"
              autoComplete="off"
              className="mt-1.5"
            />
          </div>

          <div className="w-36">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={(next) => setRole(next as InvitableRole)}>
              <SelectTrigger id="invite-role" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {invitableRoles.map((option) => (
                  <SelectItem key={option} value={option}>
                    {roleLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={sending || !email.trim()} className="gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Create invitation
          </Button>
        </form>

        {formError && (
          <p role="alert" className="text-xs text-destructive mt-2">
            {formError}
          </p>
        )}

        {freshLink && (
          <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="text-sm font-medium text-foreground">
              Invitation for {freshLink.email}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Send this link to them. It's shown once — leave the page and you'll have to issue a
              new one.
            </p>
            <div className="flex gap-2 mt-2">
              <Input readOnly value={freshLink.url} className="font-mono text-xs h-9" />
              <Button type="button" variant="secondary" onClick={onCopy} className="gap-1.5 h-9">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        )}
      </section>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="sr-only">Loading</span>
        </div>
      ) : (
        <>
          {/* Who has access ------------------------------------------- */}
          <section className="bg-card rounded-lg card-shadow p-4">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Who has access
              <span className="text-xs font-normal text-muted-foreground">
                {team.length} {team.length === 1 ? "person" : "people"}
              </span>
            </h2>

            <ul className="mt-3 divide-y divide-border">
              {team.map((member) => (
                <li
                  key={member.userId}
                  className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.name || member.email}
                      {member.userId === user?.id && (
                        <span className="text-muted-foreground font-normal"> · you</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.email} · since {formatDate(member.grantedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.userId === user?.id ? (
                      // Your own role is fixed here, so there is always a super admin.
                      <Badge
                        variant={member.role === "super_admin" ? "default" : "secondary"}
                        className="font-normal gap-1"
                      >
                        {member.role === "super_admin" && <ShieldCheck className="h-3 w-3" />}
                        {roleLabel(member.role)}
                      </Badge>
                    ) : (
                      <Select
                        value={member.role}
                        onValueChange={(next) => void onChangeRole(member, next as AdminRole)}
                      >
                        <SelectTrigger className="h-8 w-[8.5rem] text-xs" aria-label={`Role for ${member.email}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allRoles.map((option) => (
                            <SelectItem key={option} value={option} className="text-xs">
                              {roleLabel(option)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={member.userId === user?.id}
                      onClick={() => setRemoving(member)}
                      className="text-muted-foreground hover:text-destructive gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3 leading-relaxed">
              <strong className="font-medium text-foreground">Staff</strong> list cars, move orders
              along and answer customers. <strong className="font-medium text-foreground">Admins</strong>{" "}
              can also delete stock, orders and spam, and edit the website's contact details.{" "}
              <strong className="font-medium text-foreground">Super admins</strong> can also manage
              this team.
            </p>
          </section>

          {/* Invitations ---------------------------------------------- */}
          <section className="bg-card rounded-lg card-shadow p-4">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Invitations
            </h2>

            {invites.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-3">
                None yet. Anyone you invite shows up here until they accept.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {invites.map((invite) => {
                  const state = inviteState(invite);
                  const live = state.label === "Pending";

                  return (
                    <li
                      key={invite.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {invite.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {roleLabel(invite.role)} · invited {formatDate(invite.createdAt)}
                          {live && ` · expires ${formatDate(invite.expiresAt)}`}
                          {invite.acceptedAt && ` · accepted ${formatDate(invite.acceptedAt)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={state.variant} className="font-normal">
                          {state.label}
                        </Badge>
                        {live && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onRevoke(invite)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      <AlertDialog open={Boolean(removing)} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove admin access?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing?.email} loses the panel straight away. Their account stays — they can still
              sign in as a customer — and you can invite them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onRemove}>Remove access</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Team;
