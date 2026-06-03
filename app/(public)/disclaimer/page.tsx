import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/LegalPage";
import { CTASection } from "@/components/marketing/CTASection";
import { APP_NAME, PLATFORM_DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `Important disclaimers about the role of ${APP_NAME} as an introduction platform.`,
};

const LAST_UPDATED = "May 31, 2026";

const sections: LegalSection[] = [
  {
    heading: "Loan Market is an introduction platform only",
    body: [
      PLATFORM_DISCLAIMER,
      `In other words, ${APP_NAME} connects borrowers with verified lenders and nothing more. Any loan, offer, or agreement is strictly between the borrower and the lender — ${APP_NAME} is not a party to it.`,
    ],
  },
  {
    heading: "What you must not share or do",
    body: [
      "To keep everyone safe, the platform has firm rules about sensitive information and fees:",
    ],
    bullets: [
      "No document uploads — the platform does not accept financial documents or ID, and you should never try to send them.",
      "Do not share your SIN, bank login, passwords, tax documents, pay stubs, bank statements, or ID documents through the platform.",
      "Do not pay upfront fees to receive a loan. Be cautious of anyone who asks for one, and report it.",
    ],
  },
  {
    heading: "Responsibilities",
    body: [
      "Using the platform comes with responsibilities for everyone involved:",
    ],
    bullets: [
      "Users are responsible for their own due diligence on any borrower, lender, offer, or agreement.",
      "Lenders are responsible for their own licensing, advertising, disclosure, and legal compliance.",
      `${APP_NAME} may suspend or remove users or listings for safety reasons.`,
    ],
  },
  {
    heading: "No endorsement or recommendation",
    body: [
      "Verification means a lender has passed our basic review. It is not an endorsement, guarantee, or recommendation of any lender, their conduct, their pricing, or any loan terms. We do not rank or recommend one lender over another.",
    ],
  },
  {
    heading: "No financial, legal, or tax advice",
    body: [
      "Nothing on the platform is financial, legal, or tax advice. Content is provided for general information only. You should consult a qualified professional before making borrowing or lending decisions.",
    ],
  },
  {
    heading: "Do your own due diligence",
    body: [
      "Users are responsible for independently researching any borrower or lender and for reviewing all terms before agreeing to anything. Any loan or agreement is strictly between the borrower and the lender — we are not a party to it.",
    ],
  },
  {
    heading: "No guarantee of outcomes",
    body: [
      "We do not guarantee that a borrower will receive a loan, that a lender will find suitable borrowers, or that any particular terms will be offered. Outcomes depend on the parties involved.",
    ],
  },
  {
    heading: "Watch for upfront-fee requests",
    body: [
      "Be cautious of anyone who asks for an upfront fee to secure a loan. If you encounter this on the platform, please report it.",
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <>
      <LegalPage
        title="Disclaimer"
        lastUpdated={LAST_UPDATED}
        intro={`Please read this disclaimer carefully. It explains the limited role ${APP_NAME} plays.`}
        notice="This is a general template for the launch of the platform and is not legal advice. Please have it reviewed by a qualified lawyer in your jurisdiction before relying on it."
        sections={sections}
      />
      <CTASection />
    </>
  );
}
