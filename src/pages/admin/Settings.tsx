import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Loader2, Lock, Megaphone, Save } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import PasswordStrength from "@/components/PasswordStrength";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateOwnProfile, useIsAdmin } from "@/lib/admin";
import { roleLabel } from "@/lib/adminInvites";
import { useAuth } from "@/lib/auth";
import { passwordSchema } from "@/lib/password";
import { SiteSettings, fetchSiteSettings, phoneDigits, saveSiteSettings } from "@/lib/siteSettings";
import { formatDate } from "@/lib/userData";

const ANNOUNCEMENT_LIMIT = 240;

const Card = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="bg-card rounded-lg card-shadow p-5">
    <h2 className="font-display font-semibold text-foreground">{title}</h2>
    {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    <div className="mt-4">{children}</div>
  </section>
);

/** Your own profile and password, then the site-wide details (managers only). */
const Settings = () => {
  const { user, resetPassword } = useAuth();
  const { role, isManager } = useIsAdmin();

  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [site, setSite] = useState<SiteSettings | null>(null);
  const [siteError, setSiteError] = useState<string | null>(null);
  const [savingSite, setSavingSite] = useState(false);

  // Keyed on the values, not the user object: a token refresh hands back a new
  // object every hour and would wipe whatever was being typed.
  const savedName = user?.name ?? "";
  const savedPhone = user?.phone ?? "";
  useEffect(() => {
    setProfile({ name: savedName, phone: savedPhone });
  }, [savedName, savedPhone]);

  useEffect(() => {
    fetchSiteSettings()
      .then((settings) => {
        if (settings) setSite(settings);
        else setSiteError("No settings row yet — run supabase/schema.sql.");
      })
      .catch(() => setSiteError("Couldn't load the site settings. Has supabase/schema.sql been run?"));
  }, []);

  if (!user) return null;

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.name.trim()) {
      toast.error("Your name can't be empty");
      return;
    }
    setSavingProfile(true);
    try {
      await updateOwnProfile(user.id, profile);
      toast.success("Profile saved");
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Couldn't save your profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    const checked = passwordSchema.safeParse(password);
    if (!checked.success) {
      setPasswordError(checked.error.issues[0]?.message ?? "Choose a stronger password");
      return;
    }
    if (password !== confirm) {
      setPasswordError("The two passwords don't match");
      return;
    }
    setSavingPassword(true);
    try {
      await resetPassword(password);
      setPassword("");
      setConfirm("");
      toast.success("Password changed");
    } catch (issue) {
      setPasswordError(issue instanceof Error ? issue.message : "Couldn't change your password");
    } finally {
      setSavingPassword(false);
    }
  };

  const saveSite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!site) return;
    if (site.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(site.email.trim())) {
      toast.error("That contact email doesn't look right");
      return;
    }
    if (site.announcementEnabled && !site.announcement.trim()) {
      toast.error("Write the announcement, or switch it off");
      return;
    }
    setSavingSite(true);
    try {
      await saveSiteSettings(site, user.id);
      toast.success("Website updated", { description: "Visitors see the change on their next page load." });
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Couldn't save the site settings");
    } finally {
      setSavingSite(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          <span className="text-primary">Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
          {user.email}
          {role && <Badge variant="secondary">{roleLabel(role)}</Badge>}
        </p>
      </div>

      <Card title="Your profile" description="Your name appears beside the replies you send customers.">
        <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="me-name" className="text-xs font-medium">
              Name
            </Label>
            <Input
              id="me-name"
              value={profile.name}
              onChange={(event) => setProfile({ ...profile, name: event.target.value })}
              className="mt-1.5"
              autoComplete="name"
            />
          </div>
          <div>
            <Label htmlFor="me-phone" className="text-xs font-medium">
              Phone (optional)
            </Label>
            <Input
              id="me-phone"
              value={profile.phone}
              onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
              className="mt-1.5"
              autoComplete="tel"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={savingProfile} className="gap-1.5">
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save profile
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Password" description="An admin account can change what customers see, so use a strong one.">
        <form onSubmit={savePassword} className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="me-password" className="text-xs font-medium">
              New password
            </Label>
            <PasswordInput
              id="me-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="mt-1.5"
            />
            <div className="mt-2">
              <PasswordStrength value={password} />
            </div>
          </div>
          <div>
            <Label htmlFor="me-confirm" className="text-xs font-medium">
              Confirm new password
            </Label>
            <PasswordInput
              id="me-confirm"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              className="mt-1.5"
            />
          </div>
          {passwordError && (
            <p role="alert" className="sm:col-span-2 text-sm text-destructive">
              {passwordError}
            </p>
          )}
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={savingPassword || !password} className="gap-1.5">
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Change password
            </Button>
          </div>
        </form>
      </Card>

      <Card
        title="Website"
        description="Contact details shown in the header, footer, inquiry page and WhatsApp button, and an optional announcement bar."
      >
        {siteError ? (
          <p className="text-sm text-destructive">{siteError}</p>
        ) : !site ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={saveSite} className="space-y-4">
            {!isManager && (
              <p className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                Staff can see these but only an admin or super admin can change them.
              </p>
            )}
            <fieldset disabled={!isManager} className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site-email" className="text-xs font-medium">
                  Contact email
                </Label>
                <Input
                  id="site-email"
                  type="email"
                  value={site.email}
                  onChange={(event) => setSite({ ...site, email: event.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="site-phone" className="text-xs font-medium">
                  Phone, as displayed
                </Label>
                <Input
                  id="site-phone"
                  value={site.phone}
                  onChange={(event) =>
                    setSite({ ...site, phone: event.target.value, phoneRaw: phoneDigits(event.target.value) })
                  }
                  placeholder="+81-80-9718-5080"
                  className="mt-1.5"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Calls and WhatsApp go to +{site.phoneRaw || "…"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="site-address" className="text-xs font-medium">
                  Office address
                </Label>
                <Input
                  id="site-address"
                  value={site.address}
                  onChange={(event) => setSite({ ...site, address: event.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="sm:col-span-2 rounded-md border border-border p-4 space-y-3">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Megaphone className="h-4 w-4 text-accent" />
                    Announcement bar
                  </span>
                  <Switch
                    checked={site.announcementEnabled}
                    onCheckedChange={(checked) => setSite({ ...site, announcementEnabled: checked })}
                  />
                </label>
                <div>
                  <div className="flex items-baseline justify-between">
                    <Label htmlFor="site-banner" className="text-xs text-muted-foreground">
                      Shown above the header on every page
                    </Label>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {site.announcement.length}/{ANNOUNCEMENT_LIMIT}
                    </span>
                  </div>
                  <Textarea
                    id="site-banner"
                    rows={2}
                    maxLength={ANNOUNCEMENT_LIMIT}
                    value={site.announcement}
                    onChange={(event) => setSite({ ...site, announcement: event.target.value })}
                    placeholder="Our office is closed 29 Apr – 6 May for Golden Week. Shipments continue as normal."
                    className="mt-1.5 resize-none"
                  />
                </div>
                {site.announcementEnabled && site.announcement.trim() && (
                  <div className="rounded bg-accent text-accent-foreground text-sm px-3 py-2 flex items-center gap-2">
                    <Megaphone className="h-4 w-4 flex-shrink-0" />
                    {site.announcement}
                  </div>
                )}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {site.updatedAt && `Last changed ${formatDate(site.updatedAt)}`}
              </p>
              {isManager && (
                <Button type="submit" disabled={savingSite} className="gap-1.5">
                  {savingSite ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save website details
                </Button>
              )}
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Settings;
