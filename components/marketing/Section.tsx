import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/helpers";
import type { HTMLAttributes, ReactNode } from "react";

interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Optional small pill above the heading. */
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Tints the section background for visual rhythm between bands. */
  tinted?: boolean;
  /** Centers the heading block. */
  centered?: boolean;
}

/**
 * A standard marketing content band: tinted/plain background, a centered or
 * left-aligned heading group, then arbitrary children inside a Container.
 */
export function Section({
  eyebrow,
  title,
  subtitle,
  tinted = false,
  centered = false,
  className,
  children,
  ...props
}: SectionProps) {
  const hasHeading = Boolean(eyebrow || title || subtitle);

  return (
    <section
      className={cn("py-16 sm:py-20", tinted && "bg-slate-50", className)}
      {...props}
    >
      <Container>
        {hasHeading && (
          <div className={cn("max-w-2xl", centered && "mx-auto text-center")}>
            {eyebrow && <Badge>{eyebrow}</Badge>}
            {title && (
              <h2
                className={cn(
                  "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl",
                  eyebrow && "mt-4"
                )}
              >
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-3 text-base text-slate-600">{subtitle}</p>}
          </div>
        )}
        <div className={cn(hasHeading && "mt-10")}>{children}</div>
      </Container>
    </section>
  );
}
