import { cn } from "@/lib/helpers";
import type { HTMLAttributes } from "react";

/** Centered, max-width page container with responsive horizontal padding. */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />
  );
}
