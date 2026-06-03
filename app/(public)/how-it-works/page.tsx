import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button, Card, CardContent, CardTitle, Badge, Icon, type IconName } from "@/components/ui";
import { PageIntro } from "@/components/marketing/PageIntro";
import { CTASection } from "@/components/marketing/CTASection";
import { Section } from "@/components/marketing/Section";
import { APP_NAME, ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "A privacy-first, consent-based flow: post a request for free, hear from licensed lenders only, and approve every connection.",
};

const borrowerSteps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "document",
    title: "Post your request",
    body: "Tell us the loan category, amount range, and a short description. It takes a few minutes and is completely free.",
  },
  {
    icon: "eye-off",
    title: "Stay private",
    body: "Your name, phone, and email are never shown publicly. Lenders see only the details you choose to share in the request.",
  },
  {
    icon: "badge-check",
    title: "Hear from licensed lenders",
    body: "Licensed lenders who serve your category and region can send you a contact request.",
  },
  {
    icon: "handshake",
    title: "Approve who reaches you",
    body: "Review each request and approve the ones you want. Private messaging only opens after you approve.",
  },
];

const lenderSteps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "user",
    title: "Sign up as a lender",
    body: "Create a lender account and provide your business details and licence number.",
  },
  {
    icon: "shield",
    title: "Show your licence",
    body: "Your licence number appears on your listings as self-reported, so borrowers can confirm it with the regulator themselves.",
  },
  {
    icon: "search",
    title: "Browse relevant requests",
    body: "See loan requests in the categories and regions you serve.",
  },
  {
    icon: "handshake",
    title: "Connect with consent",
    body: "Send a contact request. If the borrower approves, private messaging opens.",
  },
];

function StepList({ steps }: { steps: { icon: IconName; title: string; body: string }[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <Card key={step.title} interactive className="group">
          <CardContent className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white">
                <Icon name={step.icon} className="h-5 w-5" />
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent-500">Step {i + 1}</span>
              </div>
              <CardTitle className="text-base">{step.title}</CardTitle>
              <p className="text-sm text-slate-600">{step.body}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro
        eyebrow="How it works"
        title={`How ${APP_NAME} works`}
        subtitle="A simple, privacy-first flow built around consent. Loan Market is an introduction platform — we connect people, and the lending happens directly between the parties."
      />

      <Section title="For borrowers" subtitle="Post for free and stay in control of who can contact you.">
        <StepList steps={borrowerSteps} />
        <div className="mt-6">
          <Link href={ROUTES.signupBorrower}>
            <Button>Post a Loan Request</Button>
          </Link>
        </div>
      </Section>

      <Section tinted title="For lenders" subtitle="List your products, then connect with borrowers who approve your request.">
        <StepList steps={lenderSteps} />
        <div className="mt-6">
          <Link href={ROUTES.signupLender}>
            <Button variant="outline">Join as a Licensed Lender</Button>
          </Link>
        </div>
      </Section>

      <Section>
        <Card className="bg-brand-50">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <div>
                <Badge tone="verified">Important</Badge>
                <p className="mt-2 text-sm text-slate-700">
                  Loan Market does not lend money and does not broker, approve, underwrite,
                  recommend, or arrange loans. We provide the introduction only — always do
                  your own due diligence.
                </p>
              </div>
            </div>
            <Link href={ROUTES.safety} className="shrink-0">
              <Button variant="outline" size="sm">Read about safety</Button>
            </Link>
          </CardContent>
        </Card>
      </Section>

      <CTASection />
    </>
  );
}
