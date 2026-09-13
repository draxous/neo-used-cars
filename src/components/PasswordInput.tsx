import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Password field with a visibility toggle and a caps-lock warning — the two
 * things that cause most "wrong password" retries.
 */
const PasswordInput = forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, onKeyUp, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    return (
      <div className="space-y-1.5">
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            type={visible ? "text" : "password"}
            className={cn("pr-10", className)}
            onKeyUp={(event) => {
              setCapsLock(event.getModifierState?.("CapsLock") ?? false);
              onKeyUp?.(event);
            }}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {capsLock && (
          <p className="text-xs text-accent">Caps Lock is on.</p>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
