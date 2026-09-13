import { Check } from "lucide-react";
import { passwordRules, strengthLabels } from "@/lib/password";
import { cn } from "@/lib/utils";

/** Strength meter plus the rules themselves, ticked off as they're met. */
const PasswordStrength = ({ value }: { value: string }) => {
  if (!value) return null;
  const met = passwordRules.filter((rule) => rule.test(value)).length;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index < met ? (met === 3 ? "bg-primary" : "bg-accent") : "bg-border"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground w-16 text-right">
          {strengthLabels[met]}
        </span>
      </div>
      <ul className="grid sm:grid-cols-3 gap-1">
        {passwordRules.map((rule) => {
          const ok = rule.test(value);
          return (
            <li
              key={rule.label}
              className={cn(
                "flex items-center gap-1.5 text-xs",
                ok ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Check className={cn("h-3 w-3", !ok && "opacity-30")} />
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrength;
