import type { Metadata } from "next";
import { Card, CardContent, CardTitle, Badge, Icon, type IconName } from "@/components/ui";
import { PageIntro } from "@/components/marketing/PageIntro";
import { CTASection } from "@/components/marketing/CTASection";
import { Section } from "@/components/marketing/Section";
import { APP_NAME, PLATFORM_DISCLAIMER, SAFETY_WARNINGS } from "@/lib/constants";

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
