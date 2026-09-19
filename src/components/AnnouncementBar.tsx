import { useState } from "react";
import { Megaphone, X } from "lucide-react";
import { siteConfig } from "@/config/site";

const DISMISS_KEY = "neo.announcement.dismissed";

/**
 * A one-line notice above the top bar — holiday closures, shipping delays —
 * set from /admin/settings. Dismissing hides this wording only: a new
 * announcement shows again.
 */
const AnnouncementBar = () => {
  const text = siteConfig.announcement;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === text;
    } catch {
      return false;
    }
  });

  if (!text || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, text);
    } catch {
      /* Storage blocked — it simply comes back on the next page. */
    }
  };

  return (
    <div className="bg-accent text-accent-foreground text-sm">
      <div className="container mx-auto px-4 py-2 flex items-center gap-3">
        <Megaphone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <p className="flex-1 min-w-0">{text}</p>
        <button
          type="button"
          onClick={dismiss}
          className="flex-shrink-0 rounded p-1 hover:bg-black/10 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
