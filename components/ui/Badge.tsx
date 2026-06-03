import { cn } from "@/lib/helpers";
import type { HTMLAttributes } from "react";

type BadgeTone = "brand" | "verified" | "neutral" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-700",
  verified: "bg-verified-100 text-verified-700",
  neutral: "bg-slate-100 text-slate-600",
  warning: "bg-amber-50 text-amber-700",
};

/** Small pill label used for trust signals, statuses, and section eyebrows. */
export function Badge({ tone = "brand", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
