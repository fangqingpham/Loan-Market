import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card, CardContent, CardTitle, Badge, Icon, type IconName } from "@/components/ui";
import { PageIntro } from "@/components/marketing/PageIntro";
import { CTASection } from "@/components/marketing/CTASection";
import { Section } from "@/components/marketing/Section";
import {
  LENDER_FREE_CONTACTS_PER_WEEK,
  LAUNCH_FREE_THRESHOLDS,
  CONTACT_CREDIT_PRICING,
  CREDIT_PACKS,
  CREDITS_FEE_DISCLAIMER,
  PLATFORM_DISCLAIMER,
  ROUTES,
} from "@/lib/constants";

/** Whole-dollar pack prices render without trailing cents. */
const dollars = (cents: number) => "$" + (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Borrowers post for free. Licensed lenders get free contacts during launch, then spend credits to contact borrowers — priced by loan category.",
};

const launchPerks: { icon: IconName; text: string }[] = [
  { icon: "tag", text: "Borrowers always post for free." },
  {
    icon: "spark",
    text: `Licensed lenders get ${LENDER_FREE_CONTACTS_PER_WEEK} approved contacts per week, free.`,
  },
  {
    icon: "badge-check",
    text: `Free launch continues until ${LAUNCH_FREE_THRESHOLDS.borrowerSignups} borrower posts/signups and ${LAUNCH_FREE_THRESHOLDS.licensedLenders} licensed lenders.`,
  },
];

export default function PricingPage() {
  return (
    <>
      <PageIntro
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        subtitle="Borrowers post for free. Lenders connect with credits — and during launch, contacts are free."
      />

      {/* Two headline plans */}
      <Section className="pb-0">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Borrowers */}
          <Card interactive className="flex flex-col">
            <CardContent className="flex flex-1 flex-col space-y-4">
              <div className="flex items-center justify-between">
                <Badge>For borrowers</Badge>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name="user" className="h-5 w-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">Free</p>
                <p className="mt-1 text-sm text-slate-600">No fees to post or to connect.</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  "Post a loan request for free",
                  "Your contact details stay hidden",
                  "Hear from licensed lenders only",
                  "Approve every connection",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-verified-700" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <Link href={ROUTES.signupBorrower}>
                  <Button className="w-full">Post a Loan Request</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Lenders */}
          <Card interactive className="flex flex-col border-2 border-accent-200">
            <CardContent className="flex flex-1 flex-col space-y-4">
              <div className="flex items-center justify-between">
                <Badge tone="verified">For licensed lenders</Badge>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-verified-100 text-verified-700">
                  <Icon name="badge-check" className="h-5 w-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  Free<span className="text-base font-medium text-slate-500"> during launch</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {LENDER_FREE_CONTACTS_PER_WEEK} approved contacts per week, at no cost.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {launchPerks.map((perk) => (
                  <li key={perk.text} className="flex gap-2">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-verified-700" />
                    {perk.text}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <Link href={ROUTES.signupLender}>
                  <Button variant="outline" className="w-full">Join as a Licensed Lender</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* How lenders pay after launch: credits */}
      <Section
        title="How lenders pay after launch"
        subtitle="Once the free launch period ends, lenders use credits to contact a borrower. You buy credits in a pack, then spend them as you connect — the cost depends on the loan category. Borrowers always stay free."
      >
        {/* Credit packs */}
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Credit packs
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.key}
              className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-lift"
            >
              <p className="text-2xl font-bold text-slate-900">{pack.credits}</p>
              <p className="text-xs text-slate-500">credits</p>
              <p className="mt-2 text-sm font-medium text-accent-600">{dollars(pack.amountCents)}</p>
            </div>
          ))}
        </div>

        {/* Per-category cost in credits */}
        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Contact cost by loan category
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {CONTACT_CREDIT_PRICING.map((row) => (
            <div
              key={row.label}
              className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-lift"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-accent-500 group-hover:text-white">
                  <Icon name="tag" className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-slate-700">{row.label}</span>
              </div>
              <Badge tone="neutral">{row.credits} credits</Badge>
            </div>
          ))}
        </div>

        <Card className="mt-6 bg-slate-50">
          <CardContent className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
              <Icon name="handshake" className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <CardTitle className="text-base">Credits open communication, not loans</CardTitle>
              <p className="text-sm text-slate-600">{CREDITS_FEE_DISCLAIMER}</p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-xs text-slate-500">
          Prices are shown in Canadian dollars and credits, and may change before the
          post-launch pricing takes effect. We&apos;ll communicate any pricing clearly before
          it applies.
        </p>

        <p className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-500">
          {PLATFORM_DISCLAIMER}
        </p>
      </Section>

      <CTASection />
    </>
  );
}
