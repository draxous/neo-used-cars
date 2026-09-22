import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Link2 as LinkIcon,
  Loader2,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import PasswordInput from "@/components/PasswordInput";
import PasswordStrength from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { passwordSchema } from "@/lib/password";
import { authRedirectTo, setRemember, supabase } from "@/lib/supabase";
import {
  InviteDetails,
  acceptAdminInvite,
  lookupAdminInvite,
  roleLabel,
} from "@/lib/adminInvites";

type Stage =
  /** Still checking the token. */
  | "loading"
  /** No token in the URL at all — a truncated or hand-typed link. */
  | "missing"
  /** A real token that has expired, been used or been revoked. */
  | "invalid"
  /** Signed out: choose a password. The address is not ours to change. */
  | "form"
  /** Account made, waiting for the confirmation link to be clicked. */
  | "confirm"
  /** Signed in as the invited person: granting the role. */
  | "accepting"
  /** Signed in as somebody else — a forwarded link, most likely. */
  | "mismatch"
  | "done";

/**
 * /admin/join — the separate door into the panel.
 *
 * Nothing on this page decides anything: the token is checked in the database,
 * and `accept_admin_invite` refuses unless the signed-in, confirmed address is
 * the invited one. The email field is fixed here for the same reason it is
 * fixed there — an invitation is for a person, not for whoever holds the link.
 */
const AdminJoin = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, ready, signOut } = useAuth();

  const token = params.get("token") ?? "";

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Look the invitation up once, before anyone has signed in. */
  useEffect(() => {
    // No token is a different problem from a dead one: the link was cut short
    // somewhere between being sent and being opened, and the invitation itself
    // is very probably still good. Saying so saves asking for a pointless
    // reissue — see the "missing" panel below.
    if (!token) {
      setStage("missing");
      return;
    }

    let cancelled = false;

    lookupAdminInvite(token)
      .then((details) => {
        if (cancelled) return;
        if (!details) {
          setStage("invalid");
          return;
        }
        setInvite(details);
      })
      .catch(() => {
        if (!cancelled) setStage("invalid");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const accept = useCallback(async () => {
    setStage("accepting");
    setError(null);
    try {
      const role = await acceptAdminInvite(token);
      setStage("done");
      toast.success(`You're in as ${roleLabel(role).toLowerCase()}.`);
      setTimeout(() => navigate("/admin/quotes", { replace: true }), 1200);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Couldn't accept that invitation.");
      setStage("confirm");
    }
  }, [navigate, token]);

  /* Once the invitation and the session are both known, work out the stage. */
  useEffect(() => {
    if (!invite || !ready) return;
    if (stage === "accepting" || stage === "done") return;

    if (!user) {
      setStage("form");
      return;
    }

    if (user.email.toLowerCase() !== invite.email) {
      setStage("mismatch");
      return;
    }

    // Signed in as the right person — either they already had an account, or
    // they've just come back from the confirmation email.
    if (!user.emailVerified) {
      setStage("confirm");
      return;
    }

    void accept();
  }, [invite, ready, user, stage, accept]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!invite || !supabase) return;

    const check = passwordSchema.safeParse(password);
    if (!check.success) {
      setError(check.error.issues[0].message);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setError(null);
    setSubmitting(true);
    setRemember(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          data: { name: name.trim() },
          // Back to this same page, token and all, so the invitation is
          // redeemed the moment the address is confirmed.
          emailRedirectTo: authRedirectTo(`/admin/join?token=${encodeURIComponent(token)}`),
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Supabase hands back a decoy user with no identities when the address
      // already has an account rather than admitting it exists.
      if (data.user && data.user.identities?.length === 0) {
        setError(
          "That address already has an account. Sign in and open this link again to accept."
        );
        return;
      }

      // With confirmations off a session arrives straight away; the effect
      // above then accepts. Otherwise the inbox is the next stop.
      setStage("confirm");
    } catch {
      setError("Something went wrong setting up your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const signInHref = `/login?redirect=${encodeURIComponent(`/admin/join?token=${token}`)}`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo to="/" size="md" />
        </div>

        <div className="bg-card rounded-lg card-shadow p-6">
          {stage === "loading" && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-3">Checking your invitation…</p>
            </div>
          )}

          {stage === "missing" && (
            <div className="text-center py-4">
              <LinkIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <h1 className="font-display text-xl font-bold text-foreground">
                That link is incomplete
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                An invitation link ends in <code className="text-foreground">?token=…</code>, and
                this one arrived without it — usually because it was cut short when it was copied
                or shared. Open the full link you were sent.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Your invitation is most likely still fine, so there's no need to ask for a new one
                until you've tried the whole link.
              </p>
              <Button asChild variant="secondary" className="mt-5">
                <Link to="/">Back to site</Link>
              </Button>
            </div>
          )}

          {stage === "invalid" && (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <h1 className="font-display text-xl font-bold text-foreground">
                This invitation isn't valid
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                It may have expired, been used already, or been withdrawn. Ask whoever invited you
                to send a new link.
              </p>
              <Button asChild variant="secondary" className="mt-5">
                <Link to="/">Back to site</Link>
              </Button>
            </div>
          )}

          {stage === "mismatch" && invite && (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-accent mx-auto mb-3" />
              <h1 className="font-display text-xl font-bold text-foreground">
                Signed in as someone else
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                This invitation is for{" "}
                <span className="font-medium text-foreground">{invite.email}</span>, but you're
                signed in as <span className="font-medium text-foreground">{user?.email}</span>.
              </p>
              <Button onClick={signOut} variant="secondary" className="mt-5">
                Sign out and continue
              </Button>
            </div>
          )}

          {(stage === "accepting" || stage === "done") && (
            <div className="text-center py-6">
              {stage === "done" ? (
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-3" />
              )}
              <h1 className="font-display text-xl font-bold text-foreground">
                {stage === "done" ? "You're on the team" : "Accepting your invitation…"}
              </h1>
              {stage === "done" && (
                <p className="text-sm text-muted-foreground mt-2">Taking you to the panel…</p>
              )}
            </div>
          )}

          {stage === "confirm" && invite && (
            <div className="text-center py-4">
              <MailCheck className="h-8 w-8 text-primary mx-auto mb-3" />
              <h1 className="font-display text-xl font-bold text-foreground">Confirm your email</h1>
              <p className="text-sm text-muted-foreground mt-2">
                We've sent a link to{" "}
                <span className="font-medium text-foreground">{invite.email}</span>. Click it and
                you'll come straight back here with your access granted.
              </p>
              {error && (
                <p role="alert" className="text-xs text-destructive mt-3">
                  {error}
                </p>
              )}
            </div>
          )}

          {stage === "form" && invite && (
            <>
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                <ShieldCheck className="h-4 w-4" />
                {roleLabel(invite.role)} invitation
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mt-2">
                Join the Neo admin panel
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Set a password and the panel is yours. This invitation belongs to the address
                below, so that part isn't editable.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {error}{" "}
                    {error.includes("already has an account") && (
                      <Link to={signInHref} className="font-medium underline">
                        Sign in
                      </Link>
                    )}
                  </span>
                </div>
              )}

              <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="join-email">Email address</Label>
                  <Input
                    id="join-email"
                    type="email"
                    value={invite.email}
                    readOnly
                    disabled
                    className="mt-1.5 bg-muted text-muted-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="join-name">Full name</Label>
                  <Input
                    id="join-name"
                    autoComplete="name"
                    autoFocus
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your full name"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="join-password">Password</Label>
                  <PasswordInput
                    id="join-password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    className="mt-1.5"
                  />
                  <PasswordStrength value={password} />
                </div>

                <div>
                  <Label htmlFor="join-confirm">Confirm password</Label>
                  <PasswordInput
                    id="join-confirm"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder="Re-enter your password"
                    className="mt-1.5"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full gap-2">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Accept invitation
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Already have an account on this address?{" "}
                  <Link to={signInHref} className="text-primary hover:underline">
                    Sign in instead
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminJoin;
