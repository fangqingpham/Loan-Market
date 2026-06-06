import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/LegalPage";
import { CTASection } from "@/components/marketing/CTASection";
import { APP_NAME, PLATFORM_DISCLAIMER, LEGAL_ENTITY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `Important disclaimers about the limited role of ${APP_NAME}, operated by ${LEGAL_ENTITY}, as an introduction platform.`,
};

const LAST_UPDATED = "June 5, 2026";

const sections: LegalSection[] = [
  {
    heading: "Loan Market is an introduction platform only",
    body: [
      PLATFORM_DISCLAIMER,
      `${APP_NAME} is operated by ${LEGAL_ENTITY}. It connects borrowers with lenders and brokers and nothing more. Any loan, offer, or agreement is strictly between the borrower and the lender or broker — ${APP_NAME} is not a party to it and has no involvement in or responsibility for it.`,
    ],
  },
  {
    heading: "No verification, endorsement, or recommendation",
    body: [
      "We do not verify, vet, screen, endorse, guarantee, or confirm any user, lender, broker, identity, licence, credential, listing, or loan offer. Being present or listed on the Platform is not an endorsement, guarantee, or recommendation of any user, their conduct, their pricing, or any loan terms, and we do not rank or recommend one lender or broker over another.",
      "Any licence or registration number shown is self-reported by the user and displayed as provided. We do not confirm it. Always confirm credentials yourself with the relevant regulator before dealing with anyone.",
    ],
  },
  {
    heading: "What you must not share or do",
    body: [
      "To keep everyone safe, the Platform has firm rules about sensitive information and fees:",
    ],
    bullets: [
      "No document uploads — the Platform does not accept financial documents or ID, and you should never try to send them.",
      "Do not share your SIN, bank login, passwords, tax documents, pay stubs, bank statements, or ID documents through the Platform.",
      "Do not pay upfront fees to receive a loan. Be cautious of anyone who asks for one, and report it.",
    ],
  },
  {
    heading: "Responsibilities",
    body: ["Using the Platform comes with responsibilities for everyone involved:"],
    bullets: [
      "Users are responsible for their own due diligence on any borrower, lender/broker, offer, or agreement.",
      "Lenders and brokers are responsible for their own licensing, advertising, disclosure, and legal compliance.",
      `${APP_NAME} may suspend or remove users or listings for safety or compliance reasons.`,
    ],
  },
  {
    heading: "No financial, legal, or tax advice",
    body: [
      "Nothing on the Platform is financial, legal, or tax advice. Content is provided for general information only. You should consult a qualified professional before making any borrowing or lending decision.",
    ],
  },
  {
    heading: "Do your own due diligence",
    body: [
      "You are responsible for independently researching any borrower or lender/broker and for reviewing all terms before agreeing to anything. Any loan or agreement is strictly between the borrower and the lender or broker — we are not a party to it.",
    ],
  },
  {
    heading: "No guarantee of outcomes",
    body: [
      "We do not guarantee that a borrower will receive a loan, that a lender or broker will find suitable borrowers, or that any particular terms will be offered. Outcomes depend on the parties involved.",
    ],
  },
  {
    heading: "Assumption of risk and limitation of liability",
    body: [
      `You use the Platform and deal with other users at your own risk. To the maximum extent permitted by law, ${LEGAL_ENTITY} is not liable for any loss or damage arising from your use of the Platform, from any dealings between users, or from any loan or agreement. The Platform is provided on an "as is" and "as available" basis without warranties of any kind. These disclaimers are part of, and should be read together with, our Terms of Service, which contain the full limitation of liability, release, and indemnification terms.`,
    ],
  },
  {
    heading: "Watch for upfront-fee requests",
    body: [
      "Be cautious of anyone who asks for an upfront fee to secure a loan. If you encounter this on the Platform, please report it.",
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <>
      <LegalPage
        title="Disclaimer"
        lastUpdated={LAST_UPDATED}
        intro={`Please read this disclaimer carefully. It explains the limited role ${APP_NAME} plays and should be read together with our Terms of Service and Privacy Policy.`}
        sections={sections}
      />
      <CTASection />
    </>
  );
}
