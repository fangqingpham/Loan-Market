import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card, CardContent, CardTitle, Icon, type IconName } from "@/components/ui";
import { PageIntro } from "@/components/marketing/PageIntro";
import { CTASection } from "@/components/marketing/CTASection";
import { Section } from "@/components/marketing/Section";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "For borrowers",
  description:
    "Post your loan request for free, keep your contact details private, and hear from licensed lenders only. No document uploads.",
};

const benefits: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "tag",
    title: "Always free to post",
    body: "Borrowers never pay to post a request or to be connected with licensed lenders.",
  },
  {
    icon: "eye-off",
    title: "Your contact info is hidden",
    body: "Your phone and email stay private. Lenders can't see them unless you approve their request.",
  },
  {
    icon: "no-document",
    title: "No document uploads",
    body: "We don't ask for financial documents or ID to post a request.",
  },
  {
    icon: "badge-check",
    title: "Licensed lenders only",
    body: "Lenders provide a licence number you can confirm with the regulator yourself before you deal with anyone.",
  },
  {
    icon: "handshake",
    title: "You approve every connection",
    body: "Each contact request stays pending until you approve it — you're never put on a list.",
  },
  {
    icon: "search",
    title: "Compare on your terms",
    body: "Hear from multiple licensed lenders and do your own research before deciding anything.",
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Does it cost anything to post?",
    a: "No. Posting a loan request and being connected with licensed lenders is free for borrowers.",
  },
  {
    q: "Will lenders see my phone number or email?",
    a: "No. Your contact details stay hidden until you approve a specific lender's request.",
  },
  {
    q: "Does Loan Market lend the money?",
    a: "No. Loan Market is an introduction platform. We do not lend, broker, approve, underwrite, recommend, or arrange loans.",
  },
];

export default function BorrowersPage() {
  return (
    <>
      <PageIntro
        eyebrow="For borrowers"
        title="Post your loan request for free"
        subtitle="Share what you need privately and hear from licensed lenders only. You stay anonymous until you choose to approve a connection."
      />

      <Section title="Why borrowers use Loan Market">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <Card key={b.title} interactive className="group">
              <CardContent className="space-y-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name={b.icon} className="h-5 w-5" />
                </span>
                <CardTitle className="text-base">{b.title}</CardTitle>
                <p className="text-sm text-slate-600">{b.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section tinted title="Common questions">
        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((f) => (
            <Card key={f.q} interactive>
              <CardContent className="space-y-1.5">
                <CardTitle className="text-base">{f.q}</CardTitle>
                <p className="text-sm text-slate-600">{f.a}</p>
              </CardContent>
            </Card>
          ))}
          <div className="pt-2 text-center">
            <Link
              href={ROUTES.faq}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              See all FAQs
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      <Section className="pb-4">
        <div className="text-center">
          <Link href={ROUTES.signupBorrower}>
            <Button size="lg">Post a Loan Request</Button>
          </Link>
          <p className="mt-3 text-xs text-slate-500">
            Free · Contact details hidden · No document uploads
          </p>
        </div>
      </Section>

      <CTASection
        title="Ready to post your request?"
        subtitle="It's free, private, and you control who can contact you."
      />
    </>
  );
}
