import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card, CardContent, CardTitle, Badge, Icon, type IconName } from "@/components/ui";
import { PageIntro } from "@/components/marketing/PageIntro";
import { CTASection } from "@/components/marketing/CTASection";
import { Section } from "@/components/marketing/Section";
import {
  LENDER_INTAKE_NOTE,
  PRICING_VISIBLE,
  ROUTES,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "For lenders",
  description:
    "Licensed lenders: list your products, browse relevant loan requests, and connect only with borrowers who approve your contact request. Free during launch.",
};

const benefits: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "badge-check",
    title: "Show your licence",
    body: "Display your licence number on your listings so borrowers can look you up with the regulator themselves.",
  },
  {
    icon: "search",
    title: "Relevant requests",
    body: "Browse loan requests filtered to the categories and regions you serve.",
  },
  {
    icon: "handshake",
    title: "Consent-based contact",
    body: "You reach borrowers who approve your request — no cold lists and no contact scraping.",
  },
  {
    icon: "shield",
    title: "Clear platform rules",
    body: "Everyone agrees to the same conduct and compliance rules, which keeps the marketplace trustworthy.",
  },
];

const requirements: string[] = [
  "Be a licensed lending professional or institution, and provide your licence number.",
  "Agree to the platform's conduct and compliance rules.",
  "Agree not to charge borrowers upfront fees to secure a loan.",
  "Keep your business details and licence number accurate and up to date.",
];

export default function LendersPage() {
  return (
    <>
      <PageIntro
        eyebrow="For lenders"
        title="Reach borrowers who want to hear from you"
        subtitle="List your products, browse relevant requests, and connect only with borrowers who approve your contact request."
      />

      {/* Launch highlight */}
      <Section className="pb-0">
        <Card className="border-verified-500/30 bg-verified-100/40">
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-verified-700">
                <Icon name="spark" className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <Badge tone="verified">Free during launch</Badge>
                <p className="text-sm text-slate-700">
                  Licensed lenders connect with borrowers{" "}
                  <span className="font-semibold text-slate-900">free of charge</span>{" "}
                  during launch — reach out to borrowers who approve your contact request,
                  at no cost.
                </p>
              </div>
            </div>
            {PRICING_VISIBLE && (
              <Link href={ROUTES.pricing} className="shrink-0">
                <Button variant="outline" size="sm">See pricing</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </Section>

      <Section title="Why lenders join">
        <div className="grid gap-6 sm:grid-cols-2">
          {benefits.map((b) => (
            <Card key={b.title} interactive className="group">
              <CardContent className="flex gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-verified-100 text-verified-700 transition-all duration-300 group-hover:bg-verified-600 group-hover:text-white">
                  <Icon name={b.icon} className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <CardTitle className="text-base">{b.title}</CardTitle>
                  <p className="text-sm text-slate-600">{b.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section tinted title="What we ask of lenders" subtitle="A few baseline commitments keep the marketplace trustworthy for everyone.">
        <Card className="mx-auto max-w-3xl">
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {requirements.map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-verified-100 text-verified-700">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-slate-600">{r}</span>
                </li>
              ))}
            </ul>
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              {LENDER_INTAKE_NOTE}
            </p>
          </CardContent>
        </Card>
      </Section>

      <CTASection
        title="Join as a licensed lender"
        subtitle="Sign up, list your products, then connect with borrowers who approve your request."
      />
    </>
  );
}
