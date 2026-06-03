import { cn } from "@/lib/helpers";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a hover lift + shadow transition. Use for clickable/feature cards. */
  interactive?: boolean;
  /** Solid coral feature card (white text), like the hero "service" cards. */
  accent?: boolean;
}

export function Card({ className, interactive, accent, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border shadow-sm",
        accent
          ? "border-transparent bg-accent-600 text-white shadow-accent-glow"
          : "border-slate-200 bg-white",
        interactive && "hover-lift",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 border-b border-slate-100", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-slate-900", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 border-t border-slate-100", className)} {...props} />
  );
}
