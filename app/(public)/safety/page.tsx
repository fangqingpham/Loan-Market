import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Card, CardContent, CardTitle, Badge, Icon, type IconName } from "@/components/ui";
import { PageIntro } from "@/components/marketing/PageIntro";
import { CTASection } from "@/components/marketing/CTASection";
import { Section } from "@/components/marketing/Section";
import { APP_NAME, PLATFORM_DISCLAIMER, SAFETY_WARNINGS } from "@/lib/constants";
import {
  type VerificationLink,
  VERIFY_BY_TYPE,
  NATIONAL_VERIFICATION_LINKS,
  PROVINCE_VERIFICATION_LINKS,
} from "@/lib/verification-links";

export const metadata: Metadata = {
  title: "Safety",
  description:
    "How Loan Market protects you: we don't lend or arrange loans, contact info is hidden, lenders show their licence number, and you do your own due diligence.",
};

const commitments: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "shield",
    title: "Loan Market does not lend money",
    body: "We are not a lender. No loan on this platform comes from Loan Market.",
  },
  {
    icon: "scale",
    title: "We don't broker or arrange loans",
    body: "Loan Market does not broker, approve, underwrite, recommend, or arrange loans. We provide an introduction only — any loan agreement is strictly between the borrower and the lender.",
  },
  {
    icon: "no-document",
    title: "No document uploads",
    body: "We don't ask borrowers to upload financial documents or identification to post a request.",
  },
  {
    icon: "eye-off",
    title: "Borrower contact info is hidden",
    body: "A borrower's phone and email stay private until the borrower approves a specific lender's contact request.",
  },
  {
    icon: "badge-check",
    title: "Lenders show their licence number",
    body: "Lenders provide a licence number that's displayed as self-reported. Loan Market does not confirm it — each listing links to the regulator so you can check it yourself.",
  },
  {
    icon: "search",
    title: "Do your own due diligence",
    body: "Always research any lender or borrower independently and review all terms carefully before agreeing to anything. The decision is yours.",
  },
];

const tips: string[] = SAFETY_WARNINGS;

/** External link to an official regulator / registry (opens in a new tab). */
function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-brand-700 hover:underline"
    >
      {children}
    </a>
  );
}

/** Placeholder for a province/territory with no link in a given category. */
function Dash() {
  return <span className="text-slate-400">—</span>;
}

/**
 * Renders one table cell: a real outbound link, plain text when the entry has a
 * label but no href (e.g. "Not Available"), or a dash when the entry is null.
 */
function LinkCell({ link }: { link: VerificationLink | null }) {
  if (!link) return <Dash />;
  if (!link.href) return <span className="text-slate-500">{link.label}</span>;
  return <ExtLink href={link.href}>{link.label}</ExtLink>;
}

export default function SafetyPage() {
  return (
    <>
      <PageIntro
        eyebrow="Safety"
        title="Your safety comes first"
        subtitle={`${APP_NAME} is built around privacy and consent. Here's exactly what we do — and what we don't do.`}
      />

      {/* Primary disclaimer banner — exact platform wording */}
      <Section className="pb-0">
        <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-900">Please read</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-900">{PLATFORM_DISCLAIMER}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Our commitments" subtitle="Plain statements about how the platform works.">
        <div className="grid gap-6 sm:grid-cols-2">
          {commitments.map((c) => (
            <Card key={c.title} interactive className="group">
              <CardContent className="flex gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-verified-100 text-verified-700 transition-all duration-300 group-hover:bg-verified-600 group-hover:text-white">
                  <Icon name={c.icon} className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <p className="text-sm text-slate-600">{c.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section tinted title="What Loan Market is — and isn't">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="space-y-3">
              <Badge tone="verified">
                <Icon name="check" className="h-3.5 w-3.5" />
                What we are
              </Badge>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-verified-700" />
                  An introduction platform that connects borrowers with licensed lenders.
                </li>
                <li className="flex gap-2">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-verified-700" />
                  A privacy layer that keeps borrower contact details hidden until approval.
                </li>
                <li className="flex gap-2">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-verified-700" />
                  A place where lenders show a licence number you can confirm with the regulator yourself.
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3">
              <Badge tone="warning">What we are not</Badge>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  We are not a lender and do not provide funds.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  We do not broker, approve, underwrite, recommend, or arrange loans.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  We do not give financial, legal, or tax advice.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  We do not verify, vet, or endorse lenders, or confirm their licences.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* How to verify a lender / broker / financing company */}
      <Section
        title="Verifying a lender, broker, or financing company"
        subtitle="Banks, credit unions, and financing companies aren't all licensed the same way. Here's how to check each one in Canada."
      >
        <div className="mx-auto max-w-4xl space-y-8">
          <p className="text-sm leading-relaxed text-slate-600">
            Only mortgage brokers and agents hold a personal or firm &ldquo;licence&rdquo; in the
            broker sense. Banks and credit unions aren&apos;t licensed that way &mdash; they&apos;re
            chartered, authorized, and supervised by a regulator (federal for banks, provincial for
            most credit unions). A financing company that lends its own money usually has no
            financial licence at all &mdash; it&apos;s simply an incorporated company &mdash; unless
            it offers high-cost credit, payday loans, or money services, which do require a
            provincial licence or federal registration.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {VERIFY_BY_TYPE.map((v) => (
              <Card key={v.type}>
                <CardContent className="flex gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name={v.icon} className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{v.type}</CardTitle>
                    <p className="text-sm text-slate-600">{v.how}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700">
                <Icon name="scale" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Registration is not an endorsement
                </p>
                <p className="mt-1 text-sm leading-relaxed text-amber-900">
                  Appearing in a corporate registry, or being registered with FINTRAC, only means
                  the entity exists or met a filing requirement &mdash; it does not mean a regulator
                  has vetted or approved them. FINTRAC states plainly that registration &ldquo;does
                  not indicate that FINTRAC endorses or licenses the business.&rdquo; {APP_NAME}{" "}
                  does not verify, vet, or endorse lenders &mdash; always confirm credentials
                  yourself with the regulator before dealing with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Useful links to verify a lender / financing company */}
      <Section
        tinted
        title="Useful links to check a lender or financing company"
        subtitle="Official regulator and government registries. Start with the national links, then use the table for the province where the lender operates."
      >
        <div className="space-y-10">
          <div className="grid gap-4 sm:grid-cols-2">
            {NATIONAL_VERIFICATION_LINKS.map((link) => (
              <Card key={link.title} interactive className="group">
                <CardContent className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-verified-100 text-verified-700 transition-all duration-300 group-hover:bg-verified-600 group-hover:text-white">
                    <Icon name={link.icon} className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-900 hover:text-brand-700 hover:underline"
                      >
                        {link.title}
                        <Icon name="arrow-right" className="ml-1 inline h-3.5 w-3.5 align-[-1px]" />
                      </a>
                    </CardTitle>
                    <p className="text-sm text-slate-600">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">By province or territory</h3>
            <p className="mt-1 text-sm text-slate-600">
              Credit unions and most consumer-lender licences are provincial, so check the province
              where the lender operates. Scroll the table sideways on a small screen.
            </p>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Province / territory</th>
                    <th className="px-4 py-3">Credit union</th>
                    <th className="px-4 py-3">Corporate registry</th>
                    <th className="px-4 py-3">Consumer / high-cost lender</th>
                    <th className="px-4 py-3">Mortgage licence</th>
                  </tr>
                </thead>
                <tbody>
                  {PROVINCE_VERIFICATION_LINKS.map((p) => (
                    <tr key={p.name} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                      <td className="px-4 py-3">
                        <LinkCell link={p.creditUnion} />
                      </td>
                      <td className="px-4 py-3">
                        <LinkCell link={p.corporate} />
                      </td>
                      <td className="px-4 py-3">
                        <LinkCell link={p.lenderLicence} />
                      </td>
                      <td className="px-4 py-3">
                        <LinkCell link={p.mortgage} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Links point to official regulators and government registries and were last checked in
              June 2026. If a link has moved, search the organisation name shown. For the
              territories (NT, NU, YT) there is no provincial credit-union or high-cost-credit
              framework &mdash; any credit union there would be federally regulated by OSFI.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Safety rules & your responsibilities" subtitle="These apply to everyone who uses the platform.">
        <Card className="mx-auto max-w-3xl">
          <CardContent>
            <ul className="space-y-3">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon name="shield" className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-slate-600">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Section>

      <CTASection />
    </>
  );
}
