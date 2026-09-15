import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Colour carries the triage state at a glance down a long list. */
const tone: Record<string, string> = {
  new: "border-accent/40 bg-accent/10 text-accent-foreground",
  open: "border-primary/30 bg-primary/10 text-primary",
  quoted: "border-primary/30 bg-primary/10 text-primary",
  answered: "border-primary/30 bg-primary/10 text-primary",
  closed: "border-border bg-muted text-muted-foreground",
};

interface AdminStatusSelectProps {
  value: string;
  options: string[];
  onChange: (status: string) => Promise<void>;
}

/** Writes the new status straight through, rolling back if the update fails. */
const AdminStatusSelect = ({ value, options, onChange }: AdminStatusSelectProps) => {
  const [status, setStatus] = useState(value);
  const [saving, setSaving] = useState(false);

  const handle = async (next: string) => {
    const previous = status;
    setStatus(next);
    setSaving(true);
    try {
      await onChange(next);
    } catch {
      setStatus(previous);
      toast.error("Couldn't update that status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Select value={status} onValueChange={handle} disabled={saving}>
      <SelectTrigger
        className={cn("h-8 w-[7.5rem] text-xs capitalize", tone[status] ?? "")}
        aria-label="Status"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option} className="text-xs capitalize">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AdminStatusSelect;
