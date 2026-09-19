/**
 * The editable parts of src/config/site.ts — contact details and the
 * announcement bar — stored as the single row of `site_settings`.
 *
 * Read by everyone at start-up (src/bootstrap.ts); written only by managers
 * from /admin/settings. A blank column keeps the default from site.ts, so a
 * half-filled row can't blank out the footer.
 */
import { siteConfig } from "@/config/site";
import { supabase } from "@/lib/supabase";

export interface SiteSettings {
  email: string;
  phone: string;
  phoneRaw: string;
  address: string;
  announcement: string;
  announcementEnabled: boolean;
  updatedAt: string | null;
}

type SettingsRow = {
  contact_email: string;
  phone: string;
  phone_raw: string;
  address: string;
  announcement: string;
  announcement_enabled: boolean;
  updated_at: string;
};

const fromRow = (row: SettingsRow): SiteSettings => ({
  email: row.contact_email,
  phone: row.phone,
  phoneRaw: row.phone_raw,
  address: row.address,
  announcement: row.announcement,
  announcementEnabled: row.announcement_enabled,
  updatedAt: row.updated_at,
});

export const fetchSiteSettings = async (): Promise<SiteSettings | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  return data ? fromRow(data as SettingsRow) : null;
};

/** Copies the stored values over the defaults every component reads. */
export const applySiteSettings = (settings: SiteSettings) => {
  if (settings.email.trim()) siteConfig.email = settings.email.trim();
  if (settings.phone.trim()) siteConfig.phone = settings.phone.trim();
  if (settings.phoneRaw.trim()) siteConfig.phoneRaw = settings.phoneRaw.trim();
  if (settings.address.trim()) siteConfig.address = settings.address.trim();
  siteConfig.announcement = settings.announcementEnabled ? settings.announcement.trim() : "";
};

/** Digits only, for tel: and wa.me — "+81-80-9718-5080" -> "818097185080". */
export const phoneDigits = (phone: string): string => phone.replace(/\D/g, "");

export const saveSiteSettings = async (
  settings: Omit<SiteSettings, "updatedAt">,
  userId: string
): Promise<void> => {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error, count } = await supabase
    .from("site_settings")
    .update(
      {
        contact_email: settings.email.trim(),
        phone: settings.phone.trim(),
        phone_raw: phoneDigits(settings.phoneRaw || settings.phone),
        address: settings.address.trim(),
        announcement: settings.announcement.trim(),
        announcement_enabled: settings.announcementEnabled,
        updated_by: userId,
      },
      { count: "exact" }
    )
    .eq("id", 1);

  if (error) throw new Error(error.message);
  // RLS turns a staff member's attempt into "0 rows updated", not an error.
  if (count === 0) throw new Error("Only an admin or super admin can change site settings.");

  applySiteSettings({ ...settings, updatedAt: null });
};
