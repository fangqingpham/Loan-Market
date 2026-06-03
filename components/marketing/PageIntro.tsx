import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
}

/** Standard top-of-page header band for inner marketing pages. */
export function PageIntro({ eyebrow, title, subtitle }: PageIntroProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-brand-50 via-white to-accent-50">
      {/* Soft decorative orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl"
      />
      <Container className="relative py-16 sm:py-20">
        <div className="max-w-3xl">
          {eyebrow && (
            <span className="inline-block animate-fade-up">
              <Badge tone="verified">{eyebrow}</Badge>
            </span>
          )}
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 animate-fade-up anim-delay-100 sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg leading-relaxed text-slate-600 animate-fade-up anim-delay-200">
              {subtitle}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
