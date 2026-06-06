import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/LegalPage";
import { CTASection } from "@/components/marketing/CTASection";
import {
  APP_NAME,
  PLATFORM_DISCLAIMER,
  LEGAL_ENTITY,
  SUPPORT_EMAIL,
  GOVERNING_LAW_REGION,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern your use of ${APP_NAME}, operated by ${LEGAL_ENTITY}.`,
};

const LAST_UPDATED = "June 5, 2026";

const sections: LegalSection[] = [
  {
    heading: "1. About these Terms",
    body: [
      `${APP_NAME} (the "Platform") is owned and operated by ${LEGAL_ENTITY} ("we", "us", or "our"). These Terms of Service (the "Terms") form a binding agreement between you and ${LEGAL_ENTITY} and govern your access to and use of the Platform.`,
      PLATFORM_DISCLAIMER,
      `By accessing or using the Platform, creating an account, or posting any content, you confirm that you have read, understood, and agree to be bound by these Terms and by our Privacy Policy. If you do not agree, do not use the Platform.`,
    ],
  },
  {
    heading: "2. What the Platform is — and is not",
    body: [
      "The Platform is a neutral, privacy-first online venue and introduction service. It lets borrowers post loan requests without revealing their contact details publicly, and lets lenders and mortgage brokers browse requests and ask to connect. A connection opens only after a borrower approves a request.",
      "We are a technology platform only. We are not a lender, mortgage broker, mortgage brokerage, financial institution, credit union, financing company, lead generator, financial advisor, or party to any loan. We do not lend, broker, arrange, originate, solicit, underwrite, approve, fund, service, price, negotiate, recommend, or set the terms of any loan or financial product.",
      "Any loan, application, quote, agreement, communication, payment, or transaction is solely between the borrower and the lender or broker. We are not a party to it and have no involvement in or responsibility for it.",
    ],
  },
  {
    heading: "3. No verification, endorsement, or background checks",
    body: [
      "We do not verify, vet, validate, screen, endorse, guarantee, or confirm any user, lender, broker, financing company, identity, licence number, registration, credential, qualification, statement, listing, or loan offer. Any licence or registration number shown on the Platform is self-reported by the user and displayed as provided; we do not confirm it.",
      "Any intake step, sign-up gate, account status, or label used on the Platform is an administrative convenience only. It is not a representation or warranty that any user is licensed, registered, qualified, solvent, legitimate, trustworthy, or safe to deal with, and you must not rely on it as such.",
      "You are solely responsible for independently confirming a lender's or broker's identity, licensing, and credentials with the relevant regulator, and for conducting your own due diligence, before sharing information or entering into any agreement. The Platform provides links to public regulator and registry resources for your convenience only.",
    ],
  },
  {
    heading: "4. Eligibility and accounts",
    body: [
      "You must be at least the age of majority in your jurisdiction and able to form a legally binding contract to use the Platform. You agree to provide accurate, current, and complete information and to keep it up to date.",
      "You are responsible for safeguarding your account credentials and for all activity that occurs under your account. Notify us promptly of any unauthorized use. We may refuse, suspend, or terminate accounts at our discretion.",
    ],
  },
  {
    heading: "5. Acceptable use",
    body: ["You agree to use the Platform lawfully and not to:"],
    bullets: [
      "Provide false, misleading, inaccurate, or fraudulent information, or impersonate any person or business.",
      "Charge, request, or solicit upfront fees from borrowers to secure or guarantee a loan.",
      "Violate any applicable law or regulation, including lending, consumer-protection, licensing, anti-money-laundering, privacy, and anti-spam (CASL) laws.",
      "Harvest, scrape, copy, or misuse other users' information, or use contact details for any purpose other than the specific approved connection.",
      "Attempt to bypass, disable, or interfere with the consent-based contact flow, privacy protections, security features, or rate limits.",
      "Upload or transmit malware, or attempt to gain unauthorized access to the Platform or other accounts.",
      "Harass, abuse, threaten, defame, or discriminate against any person, or post unlawful, infringing, or harmful content.",
    ],
  },
  {
    heading: "6. Safety rules: sensitive information and fees",
    body: [
      "To protect everyone, the Platform has firm rules about documents, sensitive data, and fees. By using the Platform you agree to follow them:",
    ],
    bullets: [
      "No document uploads. The Platform does not accept financial documents or ID, and you must not attempt to send them.",
      "Do not share your SIN, bank login, passwords, one-time codes, tax documents, pay stubs, bank statements, or ID documents through the Platform, including in messages.",
      "Do not pay upfront fees to receive a loan, and do not request such fees from anyone.",
      "You are responsible for your own due diligence before agreeing to anything.",
    ],
  },
  {
    heading: "7. Your content",
    body: [
      "You are solely responsible for the content you submit, including loan requests, listings, business details, and messages. You represent and warrant that you have the right to post it, that it is accurate and lawful, and that it does not infringe any third party's rights.",
      `You grant ${LEGAL_ENTITY} a non-exclusive, worldwide, royalty-free licence to host, store, display, reproduce, and use your content as needed to operate and promote the Platform. We may remove or restrict any content at any time, but we have no obligation to monitor, review, or screen content and do not guarantee that we will.`,
    ],
  },
  {
    heading: "8. Lender and broker responsibilities",
    body: [
      "If you use the Platform as a lender or broker, you are solely responsible for your own licensing, registration, advertising, disclosure, interest-rate and criminal-rate-of-interest compliance, anti-money-laundering and privacy obligations, and all other legal requirements applicable to your business. Nothing on the Platform transfers any of these responsibilities to us or constitutes legal or compliance advice.",
    ],
  },
  {
    heading: "9. No professional advice; no guarantee of outcomes",
    body: [
      "The Platform and its content are provided for general information only and are not financial, legal, tax, mortgage, or other professional advice. You should consult a qualified professional before making borrowing or lending decisions.",
      "We do not guarantee that any borrower will receive a loan, that any lender or broker will find suitable borrowers, that any particular terms will be offered, or that any connection will lead to a transaction. All decisions and outcomes are your own.",
    ],
  },
  {
    heading: "10. Assumption of risk and release",
    body: [
      "You understand that we do not control, and are not responsible for, the identity, conduct, statements, or acts or omissions of any user. You access the Platform and deal with other users entirely at your own risk.",
      `To the maximum extent permitted by law, you release and forever discharge ${LEGAL_ENTITY}, ${APP_NAME}, and our affiliates, officers, directors, employees, and agents from any and all claims, demands, disputes, liabilities, damages, and losses of every kind, known or unknown, arising out of or in any way connected with any interaction, communication, dealing, agreement, or loan between you and another user.`,
    ],
  },
  {
    heading: "11. Disclaimer of warranties",
    body: [
      `The Platform is provided on an "as is" and "as available" basis, with all faults and without warranties of any kind. To the maximum extent permitted by law, ${LEGAL_ENTITY} disclaims all warranties, express, implied, or statutory, including any implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, accuracy, and any warranties arising from course of dealing or usage of trade.`,
      "We do not warrant that the Platform will be uninterrupted, secure, timely, or error-free, that defects will be corrected, that any user or listing is legitimate or accurate, or that the Platform is free of harmful components. Some jurisdictions do not allow the exclusion of certain warranties, so some of the above exclusions may not apply to you.",
    ],
  },
  {
    heading: "12. Limitation of liability",
    body: [
      `To the maximum extent permitted by law, ${LEGAL_ENTITY}, ${APP_NAME}, and our affiliates, officers, directors, employees, and agents will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, revenue, data, goodwill, or other intangible losses, arising out of or related to your use of (or inability to use) the Platform, any dealings between users, any loan or agreement, any third-party conduct, or any unauthorized access to your information — whether based in contract, tort, statute, or otherwise, and even if we have been advised of the possibility of such damages.`,
      `To the maximum extent permitted by law, our total aggregate liability for all claims relating to the Platform will not exceed the greater of (a) the total amount you paid us, if any, in the twelve (12) months before the event giving rise to the claim, or (b) CAD $100.`,
      "Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law, including liability for fraud, gross negligence, or certain non-waivable consumer rights.",
    ],
  },
  {
    heading: "13. Indemnification",
    body: [
      `You agree to indemnify, defend, and hold harmless ${LEGAL_ENTITY}, ${APP_NAME}, and our affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or related to your use of the Platform, your content, your dealings with other users, your violation of these Terms, or your violation of any law or third-party right.`,
    ],
  },
  {
    heading: "14. Suspension, removal, and termination",
    body: [
      `${LEGAL_ENTITY} may, at its sole discretion and for any reason — including safety, compliance, or suspected breach of these Terms — suspend, restrict, or terminate your access, account, loan request, or listing, with or without notice. This includes acting on reports of prohibited conduct such as upfront-fee requests, requests for sensitive documents, or harassment.`,
      "You may stop using the Platform or close your account at any time. Sections that by their nature should survive termination — including ownership, content licence, disclaimers, release, limitation of liability, indemnification, and governing law — will survive.",
    ],
  },
  {
    heading: "15. Fees",
    body: [
      "Borrowers post for free. During launch the Platform is free for both sides. Any future fees will be described before they apply to you. Any fee charged is for access to platform communication or features only — it is never a fee for, or a guarantee of, a loan, approval, or financing.",
    ],
  },
  {
    heading: "16. Intellectual property",
    body: [
      `The Platform, including its name, logo, design, text, and software, is owned by ${LEGAL_ENTITY} or its licensors and is protected by intellectual-property laws. We grant you a limited, revocable, non-exclusive, non-transferable licence to use the Platform for its intended purpose. You may not copy, modify, distribute, sell, reverse engineer, or create derivative works from the Platform except as permitted by law.`,
    ],
  },
  {
    heading: "17. Third-party links and resources",
    body: [
      "The Platform may link to third-party websites and regulator or registry resources for your convenience. We do not control, endorse, or assume responsibility for any third-party site, content, product, or service. Your use of third-party resources is at your own risk and subject to their terms.",
    ],
  },
  {
    heading: "18. Privacy",
    body: [
      "Your use of the Platform is also governed by our Privacy Policy, which explains how we collect, use, and protect information. By using the Platform you consent to those practices.",
    ],
  },
  {
    heading: "19. Changes to the Platform and these Terms",
    body: [
      "We may modify, suspend, or discontinue any part of the Platform at any time. We may also update these Terms from time to time; when we do, we will post the updated version with a new \"last updated\" date. Material changes take effect when posted, and your continued use of the Platform means you accept the updated Terms.",
    ],
  },
  {
    heading: "20. Governing law and dispute resolution",
    body: [
      `These Terms are governed by the laws of the ${GOVERNING_LAW_REGION}, and the federal laws of Canada applicable there, without regard to conflict-of-laws rules.`,
      `Before starting any formal proceeding, you agree to first contact us at ${SUPPORT_EMAIL} and attempt in good faith to resolve the dispute informally. Any dispute that is not resolved will be subject to the exclusive jurisdiction of the courts located in the ${GOVERNING_LAW_REGION}, and you consent to that venue. To the extent permitted by law, you agree that disputes will be resolved on an individual basis and not as part of a class or representative proceeding.`,
    ],
  },
  {
    heading: "21. General",
    body: [
      "These Terms, together with the Privacy Policy and Disclaimer, are the entire agreement between you and us regarding the Platform. If any provision is found unenforceable, the remaining provisions stay in effect. Our failure to enforce any provision is not a waiver. You may not assign these Terms without our consent; we may assign them in connection with a merger, acquisition, or sale of assets. Headings are for convenience only.",
      "You consent to receive communications from us electronically, and you agree that electronic communications satisfy any legal requirement that a communication be in writing.",
    ],
  },
  {
    heading: "22. Contact",
    body: [
      `Questions about these Terms can be sent to ${LEGAL_ENTITY} at ${SUPPORT_EMAIL}, or through the Contact page.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <LegalPage
        title="Terms of Service"
        lastUpdated={LAST_UPDATED}
        intro={`These Terms govern your use of ${APP_NAME}, operated by ${LEGAL_ENTITY}. Please read them carefully — they include important limitations of liability and a release of claims.`}
        sections={sections}
      />
      <CTASection />
    </>
  );
}
