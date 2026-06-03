import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/LegalPage";
import { CTASection } from "@/components/marketing/CTASection";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${APP_NAME} collects, uses, and protects your information.`,
};

const LAST_UPDATED = "May 31, 2026";

const sections: LegalSection[] = [
  {
    heading: "1. Our approach to privacy",
    body: [
      `Privacy is central to ${APP_NAME}. The platform is designed so that a borrower's contact details stay hidden until the borrower approves a specific verified lender's request. This policy explains what we collect and how we use it.`,
    ],
  },
  {
    heading: "2. Information we collect",
    body: ["We collect information you provide and a limited amount of technical information, including:"],
    bullets: [
      "Account details such as name, email, and role (borrower or lender).",
      "Loan request details borrowers choose to share (such as category, amount range, and description).",
      "Lender verification details, such as business information and operating regions.",
      "Basic technical data needed to operate and secure the service.",
    ],
  },
  {
    heading: "3. What we don't ask for",
    body: [
      "We don't ask borrowers to upload financial documents or identification to post a request. We aim to collect only what we need to run a safe introduction platform.",
    ],
  },
  {
    heading: "4. Sensitive information you should never share",
    body: [
      "The platform has no document-upload feature, and you should never attempt to send sensitive information through it — including in messages. To protect yourself, do not share:",
    ],
    bullets: [
      "Your SIN or other government identification numbers.",
      "Bank login credentials, passwords, or one-time codes.",
      "Tax documents, pay stubs, bank statements, or ID documents.",
    ],
  },
  {
    heading: "5. How borrower contact details are protected",
    body: [
      "A borrower's contact information is not shown publicly and is not shared with a lender unless and until the borrower approves that lender's contact request. You stay in control of who can reach you.",
    ],
  },
  {
    heading: "6. How we use information",
    body: ["We use your information to:"],
    bullets: [
      "Operate the platform and connect borrowers with verified lenders.",
      "Verify lenders and maintain trust and safety.",
      "Communicate with you about your account and the service.",
      "Improve and secure the platform.",
    ],
  },
  {
    heading: "7. Sharing of information",
    body: [
      "We share information only as needed to operate the service — for example, showing the parts of a borrower's request that the borrower chose to include, or sharing contact details with a lender after the borrower approves a connection. We may also share information with service providers who help us run the platform, or where required by law. We don't sell your personal information.",
    ],
  },
  {
    heading: "8. Data retention",
    body: [
      "We keep information for as long as needed to provide the service and meet legal obligations. You can request deletion of your account, subject to any records we are required to keep.",
    ],
  },
  {
    heading: "9. Your choices and rights",
    body: [
      "Depending on where you live, you may have rights to access, correct, or delete your personal information, or to object to certain processing. You can exercise these rights using the support contact within the platform.",
    ],
  },
  {
    heading: "10. Changes to this policy",
    body: [
      "We may update this policy from time to time and will post the updated version with a new \"last updated\" date.",
    ],
  },
  {
    heading: "11. Contact",
    body: ["For privacy questions, use the support contact listed within the platform."],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <LegalPage
        title="Privacy Policy"
        lastUpdated={LAST_UPDATED}
        intro={`This policy explains how ${APP_NAME} handles your information and protects borrower privacy.`}
        notice="This is a general template for the launch of the platform and is not legal advice. Please have it reviewed by a qualified privacy professional or lawyer in your jurisdiction before relying on it."
        sections={sections}
      />
      <CTASection />
    </>
  );
}
