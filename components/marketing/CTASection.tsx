import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/constants";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
}

/**
 * Reusable closing call-to-action band with the two primary actions used
 * across the marketing site. Bold dark band with a coral accent to match the
 * hero, so every page ends on a strong, on-brand note.
 */
export function CTASection({
  title = "Ready to get started?",
  subtitle = "Post your loan request for free, or join as a lender/broker. You stay in control of who can contact you.",
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-ink-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-900 to-ink-950" />
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-accent-600/25 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
      </div>
      <Container className="relative py-20 text-center sm:py-24">
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">{subtitle}</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={ROUTES.signupBorrower}>
            <Button variant="accent" size="lg" className="w-full rounded-full sm:w-auto">
              Post a Loan Request
              <Icon name="arrow-right" className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href={ROUTES.signupLender}>
            <Button
              size="lg"
              className="w-full rounded-full border border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              Join as a Lender/Broker
            </Button>
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-400">
          Free for borrowers. No document uploads. Your contact details stay private.
        </p>
      </Container>
    </section>
  );
}
