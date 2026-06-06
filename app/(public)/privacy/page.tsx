import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/LegalPage";
import { CTASection } from "@/components/marketing/CTASection";
import { APP_NAME, LEGAL_ENTITY, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${APP_NAME}, operated by ${LEGAL_ENTITY}, collects, uses, and protects your information.`,
};

const LAST_UPDATED = "June 5, 2026";

const sections: LegalSection[] = [
  {
    heading: "1. About this policy",
    body: [
      `${APP_NAME} (the "Platform") is owned and operated by ${LEGAL_ENTITY} ("we", "us", or "our"). This Privacy Policy explains what information we collect, how we use and share it, and the choices you have. We handle personal information in accordance with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) and other applicable privacy laws.`,
      "Privacy is central to how the Platform works: a borrower's contact details stay hidden until the borrower approves a specific lender or broker's request.",
    ],
  },
  {
    heading: "2. Information we collect",
    body: ["We collect the information you provide and a limited amount of technical information, including:"],
    bullets: [
      "Account details, such as name, email, role (borrower, lender, or broker), and password (stored in encrypted form).",
      "Loan request details a borrower chooses to share, such as category, amount range, location, and description.",
      "Lender or broker business details, such as business name, type, operating regions, and any self-reported licence or registration number.",
      "Messages and content you submit through the Platform.",
      "Technical and usage data, such as IP address, device and browser information, and log data, collected to operate and secure the service.",
    ],
  },
  {
    heading: "3. What we do not ask for",
    body: [
      "The Platform has no document-upload feature. We do not ask borrowers to upload financial documents or identification to post a request. We aim to collect only what we need to run a safe introduction platform. We do not store full payment card numbers; any payments are handled by a third-party payment processor.",
    ],
  },
  {
    heading: "4. Sensitive information you should never share",
    body: [
      "To protect yourself, never attempt to send sensitive information through the Platform, including in messages. In particular, do not share:",
    ],
    bullets: [
      "Your SIN or other government identification numbers.",
      "Bank login credentials, passwords, or one-time codes.",
      "Tax documents, pay stubs, bank statements, or ID documents.",
    ],
  },
  {
    heading: "5. How we use information",
    body: ["We use your information to:"],
    bullets: [
      "Operate the Platform and connect borrowers with lenders and brokers through the consent-based contact flow.",
      "Maintain trust and safety, prevent fraud, abuse, and spam, and enforce our Terms.",
      "Communicate with you about your account, requests, and the service.",
      "Improve, develop, and secure the Platform.",
      "Comply with legal obligations and respond to lawful requests.",
    ],
  },
  {
    heading: "6. Consent",
    body: [
      "By creating an account, posting content, or otherwise using the Platform, you consent to the collection, use, and disclosure of your information as described in this policy. Where required, we rely on your consent to send electronic messages in compliance with Canada's Anti-Spam Legislation (CASL).",
      "You may withdraw your consent at any time by closing your account or contacting us, though doing so may limit your ability to use the Platform.",
    ],
  },
  {
    heading: "7. How borrower contact details are protected",
    body: [
      "A borrower's contact information is not shown publicly and is not shared with a lender or broker unless and until the borrower approves that party's contact request. You stay in control of who can reach you.",
    ],
  },
  {
    heading: "8. How we share information",
    body: ["We do not sell your personal information. We share information only as needed to operate the service, including:"],
    bullets: [
      "With other users, only as you direct — for example, the parts of a request a borrower chooses to include, or contact details shared after a borrower approves a connection.",
      "With service providers who help us run the Platform (such as hosting, database, and payment processing providers), under obligations to protect your information.",
      "Where required by law, regulation, legal process, or to protect the rights, safety, and security of users, the public, or the Platform.",
      "In connection with a merger, acquisition, financing, or sale of assets, in which case we will require the recipient to honour this policy.",
    ],
  },
  {
    heading: "9. Service providers and data location",
    body: [
      "We use trusted third-party service providers to operate the Platform. These providers may store or process information on servers located outside your province or outside Canada, including in the United States. Where that happens, your information may be subject to the laws of those jurisdictions, including lawful access by their authorities. We take reasonable steps to ensure providers protect your information.",
    ],
  },
  {
    heading: "10. Data security",
    body: [
      "We use reasonable administrative, technical, and physical safeguards designed to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security. You use the Platform and share information at your own risk, and you should never send sensitive information through messages.",
    ],
  },
  {
    heading: "11. Data retention",
    body: [
      "We keep information for as long as needed to provide the service and to meet legal, accounting, or reporting obligations. You can request deletion of your account, subject to information we are required or reasonably need to retain.",
    ],
  },
  {
    heading: "12. Your rights and choices",
    body: [
      `Depending on where you live, you may have the right to access, correct, or delete your personal information, to withdraw consent, or to object to or restrict certain processing. To exercise these rights, contact us at ${SUPPORT_EMAIL}. We may need to verify your identity before responding, and we will respond within the time required by applicable law.`,
    ],
  },
  {
    heading: "13. Children's privacy",
    body: [
      "The Platform is intended for adults who are at least the age of majority in their jurisdiction. It is not directed to children, and we do not knowingly collect personal information from minors. If you believe a minor has provided us information, please contact us so we can remove it.",
    ],
  },
  {
    heading: "14. Third-party links",
    body: [
      "The Platform may link to third-party websites and regulator or registry resources. We are not responsible for the privacy practices or content of those sites. Please review their privacy policies before providing any information.",
    ],
  },
  {
    heading: "15. Changes to this policy",
    body: [
      "We may update this policy from time to time. When we do, we will post the updated version with a new \"last updated\" date. Material changes take effect when posted.",
    ],
  },
  {
    heading: "16. Contact",
    body: [
      `For privacy questions or to exercise your rights, contact ${LEGAL_ENTITY} at ${SUPPORT_EMAIL}, or through the Contact page.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <LegalPage
        title="Privacy Policy"
        lastUpdated={LAST_UPDATED}
        intro={`This policy explains how ${APP_NAME}, operated by ${LEGAL_ENTITY}, handles your information and protects borrower privacy.`}
        sections={sections}
      />
      <CTASection />
    </>
  );
}
