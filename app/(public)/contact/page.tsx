import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardTitle, Badge, Icon } from "@/components/ui";
import { ContactForm } from "@/components/marketing/ContactForm";
import { PageIntro } from "@/components/marketing/PageIntro";
import { CTASection } from "@/components/marketing/CTASection";
import { Section } from "@/components/marketing/Section";
import { APP_NAME, ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Loan Market, operated by Nexus Milestone Inc. Email us with questions about the platform, your account, or to report a problem.",
};

const COMPANY = "Nexus Milestone Inc.";

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Get in touch"
        subtitle={`Questions about ${APP_NAME}, your account, or something you've seen on the platform? We'd like to hear from you.`}
      />

      <Section className="pb-0">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {/* Email */}
          <Card interactive className="group">
            <CardContent className="space-y-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white">
                <Icon name="message" className="h-5 w-5" />
              </span>
              <CardTitle className="text-base">Email us</CardTitle>
              <p className="text-sm text-slate-600">
                The fastest way to reach us. We read every message and aim to reply within a
                couple of business days.
              </p>
              <div className="pt-1">
                <ContactForm />
              </div>
            </CardContent>
          </Card>

          {/* Company */}
          <Card>
            <CardContent className="space-y-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-verified-100 text-verified-700">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <CardTitle className="text-base">Who runs Loan Market</CardTitle>
              <p className="text-sm text-slate-600">
                {APP_NAME} is owned and operated by{" "}
                <span className="font-medium text-slate-900">{COMPANY}</span>. We&apos;re an
                introduction platform — we don&apos;t lend, broker, approve, underwrite,
                recommend, or arrange loans, and we can&apos;t provide financial or legal advice.
              </p>
              <p className="text-sm text-slate-600">
                For questions about a lender or broker&apos;s credentials, the{" "}
                <Link href={ROUTES.safety} className="font-medium text-brand-700 hover:underline">
                  Safety page
                </Link>{" "}
                lists official regulator and registry links you can use to check them yourself.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Before you write" subtitle="A few quick links that answer the most common questions.">
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          <Link href={ROUTES.faq} className="group">
            <Card interactive className="h-full">
              <CardContent className="space-y-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name="search" className="h-4 w-4" />
                </span>
                <CardTitle className="text-sm">Read the FAQ</CardTitle>
                <p className="text-sm text-slate-600">How the platform works, privacy, and cost.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href={ROUTES.safety} className="group">
            <Card interactive className="h-full">
              <CardContent className="space-y-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name="shield" className="h-4 w-4" />
                </span>
                <CardTitle className="text-sm">Safety &amp; reporting</CardTitle>
                <p className="text-sm text-slate-600">
                  Verify a lender/broker, or report something that doesn&apos;t look right.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={ROUTES.howItWorks} className="group">
            <Card interactive className="h-full">
              <CardContent className="space-y-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name="document" className="h-4 w-4" />
                </span>
                <CardTitle className="text-sm">How it works</CardTitle>
                <p className="text-sm text-slate-600">The step-by-step flow for both sides.</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mx-auto mt-8 max-w-4xl">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <Badge tone="warning">Please note</Badge>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              Never send your SIN, bank login, passwords, or financial documents by email. We
              will never ask for them, and no legitimate request requires them to start a
              conversation.
            </p>
          </div>
        </div>
      </Section>

      <CTASection />
    </>
  );
}
