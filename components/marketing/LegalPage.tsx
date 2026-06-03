import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";

export type LegalSection = {
  heading: string;
  /** Paragraphs of body text. */
  body?: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
};

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: LegalSection[];
  /** Shown in a callout at the top — useful for the standard "not advice" note. */
  notice?: string;
}

/**
 * Shared layout for Terms, Privacy, and Disclaimer pages. Plain, readable
 * typography (no typography plugin needed) with a consistent header and notice.
 */
export function LegalPage({ title, lastUpdated, intro, sections, notice }: LegalPageProps) {
  return (
    <section className="py-14 sm:py-16">
      <Container>
        <article className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>

          {notice && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Badge tone="warning">Please note</Badge>
              <p className="mt-2 text-sm text-amber-900">{notice}</p>
            </div>
          )}

          {intro && <p className="mt-6 text-base leading-relaxed text-slate-600">{intro}</p>}

          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-semibold text-slate-900">{section.heading}</h2>
                {section.body?.map((paragraph, i) => (
                  <p key={i} className="mt-3 text-sm leading-relaxed text-slate-600">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </Container>
    </section>
  );
}
