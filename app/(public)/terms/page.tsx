import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/LegalPage";
import { CTASection } from "@/components/marketing/CTASection";
import { APP_NAME, PLATFORM_DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern your use of ${APP_NAME}.`,
};

const LAST_UPDATED = "May 31, 2026";

const sections: LegalSection[] = [
  {
    heading: "1. About Loan Market",
    body: [
      PLATFORM_DISCLAIMER,
      `By accessing or using the platform, you agree to these Terms of Service. If you do not agree, please do not use the platform.`,
    ],
  },
  {
    heading: "2. What the platform does",
    body: [
      "Borrowers can post loan requests for free without publicly revealing their contact details. Verified lenders can browse requests and ask to connect. A connection only opens after the borrower approves a lender's request.",
      "Any loan, agreement, or transaction that results from a connection is strictly between the borrower and the lender. We are not a party to it.",
    ],
  },
  {
    heading: "3. Eligibility and accounts",
    body: [
      "You must be of legal age and able to enter into a binding agreement in your jurisdiction to use the platform. You are responsible for keeping your account credentials secure and for all activity under your account.",
      "You agree to provide accurate information and to keep it up to date. Lenders agree to complete verification and to maintain accurate verification details.",
    ],
  },
  {
    heading: "4. Verification of lenders",
    body: [
      "We manually review lenders before granting verified status. Verification is a basic review and does not constitute an endorsement, guarantee, or recommendation of any lender, their conduct, or any loan terms they may offer. Users must perform their own due diligence.",
    ],
  },
  {
    heading: "5. Acceptable use",
    body: ["You agree not to misuse the platform. In particular, you agree not to:"],
    bullets: [
      "Provide false, misleading, or fraudulent information.",
      "Charge borrowers upfront fees to secure a loan, or solicit such fees.",
      "Harvest, scrape, or misuse other users' information.",
      "Use the platform for any unlawful purpose or in violation of applicable lending laws.",
      "Attempt to bypass the consent-based contact flow or the privacy protections.",
    ],
  },
  {
    heading: "6. Safety rules: sensitive information and fees",
    body: [
      "To protect everyone, the platform has firm rules about documents, sensitive data, and fees. By using the platform you agree to follow them:",
    ],
    bullets: [
      "No document uploads. The platform does not accept financial documents or ID, and you must not attempt to send them.",
      "Do not share your SIN, bank login, passwords, tax documents, pay stubs, bank statements, or ID documents through the platform.",
      "Do not pay upfront fees to receive a loan, and do not request such fees from anyone.",
      "You are responsible for your own due diligence before agreeing to anything.",
    ],
  },
  {
    heading: "7. Lender responsibilities",
    body: [
      "Lenders are solely responsible for their own licensing, advertising, disclosure, interest-rate compliance, and all other legal obligations applicable to their business. Verification by us is a basic review only and does not transfer any of these responsibilities to us, nor does it endorse a lender or any loan terms.",
    ],
  },
  {
    heading: "8. Suspension and removal",
    body: [
      `${APP_NAME} may, at its discretion and for safety or compliance reasons, suspend or remove any user, account, loan request, or listing — with or without notice. This includes responding to reports of prohibited conduct such as upfront-fee requests, requests for sensitive documents, or harassment.`,
    ],
  },
  {
    heading: "9. Fees",
    body: [
      "Borrowers post for free. Lender fees and any borrower-initiated contact fees are described on the Pricing page. We will communicate any pricing clearly before it applies to you.",
    ],
  },
  {
    heading: "10. No advice and no guarantees",
    body: [
      "We do not provide financial, legal, tax, or other professional advice. We do not guarantee that any borrower will receive a loan or that any lender will find suitable borrowers. Decisions you make based on connections formed through the platform are your own.",
    ],
  },
  {
    heading: "11. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, we are not liable for any loss or damage arising from your use of the platform, from any dealings between borrowers and lenders, or from any loan agreement. The platform is provided on an \"as is\" and \"as available\" basis.",
    ],
  },
  {
    heading: "12. Changes to these terms",
    body: [
      "We may update these terms from time to time. We will post the updated version with a new \"last updated\" date. Continued use of the platform after changes take effect means you accept the updated terms.",
    ],
  },
  {
    heading: "13. Contact",
    body: [
      "Questions about these terms can be sent to our support contact listed within the platform.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <LegalPage
        title="Terms of Service"
        lastUpdated={LAST_UPDATED}
        intro={`These terms govern your use of ${APP_NAME}. Please read them carefully.`}
        notice="This is a general template for the launch of the platform and is not legal advice. Please have it reviewed by a qualified lawyer in your jurisdiction before relying on it."
        sections={sections}
      />
      <CTASection />
    </>
  );
}
