import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui";
import { PageIntro } from "@/components/marketing/PageIntro";
import { CTASection } from "@/components/marketing/CTASection";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about how Loan Market works, privacy, and lender licences.",
};

type QA = { q: string; a: string };
type Group = { heading: string; items: QA[] };

const groups: Group[] = [
  {
    heading: "Getting started",
    items: [
      {
        q: "What is Loan Market?",
        a: `${APP_NAME} is a privacy-first introduction platform. Borrowers post loan requests for free and connect with licensed lenders only. We connect people — we don't lend, broker, or arrange the loan ourselves, and we don't verify or endorse anyone.`,
      },
      {
        q: "How do I post a loan request?",
        a: "Create a borrower account, choose your loan category, add an amount range and a short description, and post. It's free and takes a few minutes.",
      },
      {
        q: "How do I become a lender?",
        a: "Create a lender account, agree to the platform rules, and provide your licence number. Your licence number is shown on your listings as self-reported so borrowers can confirm it with the regulator themselves.",
      },
    ],
  },
  {
    heading: "Privacy & safety",
    items: [
      {
        q: "Will lenders see my contact details?",
        a: "No. Your phone and email stay hidden until you approve a specific lender's contact request.",
      },
      {
        q: "Do I have to upload documents?",
        a: "No. The platform has no document-upload feature, and we never ask borrowers to upload financial documents or ID to post a request.",
      },
      {
        q: "What should I never share on the platform?",
        a: "Never share your SIN, bank login, passwords, tax documents, pay stubs, bank statements, or ID documents — including in messages. No legitimate connection on the platform requires these to start a conversation.",
      },
      {
        q: "Should I ever pay an upfront fee to get a loan?",
        a: "No. Do not pay upfront fees to receive a loan. Be cautious of anyone who asks for one, and please report it so we can review and, if needed, suspend or remove the user.",
      },
      {
        q: "Does Loan Market lend or approve loans?",
        a: "No. Loan Market is a marketplace and contact-introduction platform. We do not lend money, broker loans, arrange mortgages, provide financial advice, verify borrower information, guarantee approval, negotiate terms, underwrite loans, or participate in loan transactions. Always do your own due diligence before agreeing to anything.",
      },
      {
        q: "Who is responsible for a lender's licensing and compliance?",
        a: "Lenders are. Each lender is solely responsible for their own licensing, advertising, disclosure, and legal compliance. Loan Market does not verify or endorse lenders.",
      },
      {
        q: "Does Loan Market check lender licences?",
        a: "No. Lenders provide their own licence number, which we display as self-reported. We do not confirm it. Each lender listing links to the regulator's public register so you can confirm the licence yourself before dealing with anyone.",
      },
    ],
  },
  {
    heading: "Cost",
    items: [
      {
        q: "Is it free to use?",
        a: "Yes. During launch, Loan Market is free for both borrowers and lenders — there's no charge to post a request, list a product, or connect when a request is approved.",
      },
      {
        q: "Is there a limit on how many people I can contact?",
        a: "To keep the marketplace free of spam, each account can start a small number of new contact requests per day. Conversations you've already opened are never affected, and the limit resets the next day.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <PageIntro
        eyebrow="FAQ"
        title="Frequently asked questions"
        subtitle="Quick answers about how Loan Market works, privacy, and lender licences."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl space-y-10">
            {groups.map((group) => (
              <div key={group.heading}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {group.heading}
                </h2>
                <div className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-accent-300 hover:shadow-soft open:border-accent-300"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-medium text-slate-900">
                        {item.q}
                        <Icon
                          name="arrow-right"
                          className="h-4 w-4 shrink-0 text-accent-500 transition-transform group-open:rotate-90"
                        />
                      </summary>
                      <p className="px-5 pb-5 text-sm text-slate-600">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
