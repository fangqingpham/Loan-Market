/** App-wide constants for Loan Market. */
import type {
  LoanCategory,
  UserRole,
  Province,
  LenderType,
  SecuredStatus,
  ListingStatus,
} from "@/types/database";

export const APP_NAME = "Loan Market";
export const APP_TAGLINE = "A privacy-first loan marketplace.";

/** One-line marketing promise used across the public site. */
export const APP_PROMISE =
  "Post your loan request for free. Connect with trusted lenders/brokers only.";

/** Brand slogan shown next to the logo in the navbar. */
export const APP_SLOGAN = "A Marketplace Where Borrowers Find Trusted Lenders/Brokers";

/** Legal operating entity and primary contact (used in legal pages, contact, footer). */
export const LEGAL_ENTITY = "Nexus Milestone Inc.";
export const SUPPORT_EMAIL = "seed2success.financial@outlook.com";
export const GOVERNING_LAW_REGION = "Province of Ontario, Canada";

export const USER_ROLES: Record<Uppercase<UserRole>, UserRole> = {
  BORROWER: "borrower",
  LENDER: "lender",
  ADMIN: "admin",
};

export const LOAN_CATEGORIES: { value: LoanCategory; label: string }[] = [
  { value: "mortgage", label: "Mortgage" },
  { value: "refinance", label: "Refinance" },
  { value: "personal", label: "Personal Loan" },
  { value: "auto", label: "Auto Loan" },
  { value: "business", label: "Business Loan" },
  { value: "debt_consolidation", label: "Debt Consolidation" },
  { value: "home_equity", label: "Home Equity" },
  { value: "other", label: "Other" },
];

/** Canadian provinces/territories for signup forms. */
export const PROVINCES: { value: Province; label: string }[] = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" },
];

/** Lender types for the lender signup form. */
export const LENDER_TYPES: { value: LenderType; label: string }[] = [
  { value: "mortgage_broker", label: "Mortgage Broker" },
  { value: "mortgage_agent", label: "Mortgage Agent" },
  { value: "private_lender", label: "Private Lender" },
  { value: "financing_company", label: "Financing Company" },
  { value: "bank", label: "Bank" },
  { value: "credit_union", label: "Credit Union" },
  { value: "other", label: "Other" },
];

/* ── Loan request form options ───────────────────────────────── */
// Stored as free text / enums in the DB. These are the curated choices the
// borrower picks from when posting a request.

export const SECURED_STATUS_OPTIONS: { value: SecuredStatus; label: string }[] = [
  { value: "unsecured", label: "Unsecured (no collateral)" },
  { value: "secured", label: "Secured (backed by collateral)" },
  { value: "either", label: "Either / not sure" },
];

/** Human-readable labels for a loan request's lifecycle status. */
export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  active: "Active",
  delisted: "Delisted",
  removed_by_admin: "Removed by admin",
};

export const AMOUNT_RANGES: string[] = [
  "Under $5,000",
  "$5,000 – $10,000",
  "$10,000 – $25,000",
  "$25,000 – $50,000",
  "$50,000 – $100,000",
  "$100,000 – $250,000",
  "$250,000 – $500,000",
  "$500,000 – $1,000,000",
  "$1,000,000+",
];

export const PURPOSE_CATEGORIES: string[] = [
  "Home purchase",
  "Refinance",
  "Debt consolidation",
  "Vehicle purchase",
  "Business / working capital",
  "Education",
  "Home improvement / renovation",
  "Medical expenses",
  "Major purchase",
  "Other",
];

export const CREDIT_SCORE_RANGES: string[] = [
  "Excellent (760+)",
  "Very good (725 – 759)",
  "Good (660 – 724)",
  "Fair (560 – 659)",
  "Poor (below 560)",
  "Prefer not to say",
];

export const INCOME_RANGES: string[] = [
  "Under $25,000",
  "$25,000 – $50,000",
  "$50,000 – $75,000",
  "$75,000 – $100,000",
  "$100,000 – $150,000",
  "$150,000 – $200,000",
  "$200,000+",
  "Prefer not to say",
];

export const EMPLOYMENT_TYPES: string[] = [
  "Full-time employee",
  "Part-time employee",
  "Self-employed",
  "Contract / freelance",
  "Retired",
  "Student",
  "Other",
];

export const LOAN_TERM_RANGES: string[] = [
  "Under 1 year",
  "1 – 3 years",
  "3 – 5 years",
  "5 – 10 years",
  "10 – 20 years",
  "20+ years",
  "Flexible",
];

export const INTEREST_RANGES: string[] = [
  "Under 4%",
  "4% – 5%",
  "5% – 8%",
  "8% – 12%",
  "12% – 20%",
  "20%+",
  "Open / not sure",
];

/** Rate ranges a lender advertises on a product listing. */
export const RATE_RANGES: string[] = [
  "Under 4%",
  "4% – 6%",
  "6% – 8%",
  "8% – 12%",
  "12% – 18%",
  "18%+",
  "Varies / depends on profile",
];

/**
 * Mandatory safety warning shown before a borrower posts a request. The borrower
 * must explicitly acknowledge it. Wording is fixed by product/compliance.
 */
export const LOAN_REQUEST_POSTING_WARNING =
  "Do not post SIN, bank login, passwords, ID documents, pay stubs, tax returns, " +
  "bank statements, full address, or employer name. Loan Market does not verify loan " +
  "offers, arrange loans, approve loans, or provide financial advice.";

/**
 * Note shown to a lender before posting a product listing. Listings carry NO
 * contact fields — connection happens only through an approved conversation.
 */
export const PRODUCT_POSTING_NOTE =
  "Describe your product in general terms. Do not include phone, email, website, " +
  "or any direct contact details — borrowers connect with you only through an " +
  "approved in-platform conversation. Loan Market does not verify, endorse, or " +
  "arrange the products you list.";

/**
 * Report reasons (value stored in reports.reason; label shown in the UI).
 * Wording mirrors the product/compliance list.
 */
export const REPORT_REASONS: { value: string; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "scam_fake_lender", label: "Scam / fake lender/broker" },
  { value: "upfront_fee_request", label: "Upfront fee request" },
  { value: "misleading_loan_claim", label: "Misleading loan claim" },
  { value: "harassment", label: "Harassment" },
  { value: "asking_sensitive_documents", label: "Asking for sensitive documents" },
  { value: "asking_sin_bank_password", label: "Asking for SIN / bank login / password" },
  { value: "abusive_language", label: "Abusive language" },
  { value: "suspicious_behaviour", label: "Suspicious behaviour" },
  { value: "other", label: "Other" },
];

/* ── Canonical legal / safety wording (Stage 14) ─────────────────
 * Single source of truth for the disclaimer and safety warnings used across the
 * legal pages, marketing pages, and in-product acknowledgements. Change the
 * wording here and every surface updates together. This is practical website
 * disclaimer language, not legal advice.
 */

/** The primary platform disclaimer. Verbatim wording fixed by product/compliance. */
export const PLATFORM_DISCLAIMER =
  "Loan Market is a marketplace and contact-introduction platform. Loan Market does " +
  "not lend money, broker loans, arrange mortgages, provide financial advice, verify " +
  "borrower information, guarantee approval, negotiate terms, underwrite loans, or " +
  "participate in loan transactions.";

/** The full list of platform safety warnings shown to users. */
export const SAFETY_WARNINGS: string[] = [
  "No document uploads. The platform does not accept financial documents or ID, and you should never try to send them.",
  "Do not share your SIN, bank login, passwords, tax documents, pay stubs, bank statements, or ID documents through the platform.",
  "Do not pay upfront fees to receive a loan. Be cautious of anyone who asks for one, and report it.",
  "You are responsible for your own due diligence on any borrower, lender/broker, offer, or agreement.",
  "Lenders and brokers are responsible for their own licensing, advertising, disclosure, and legal compliance.",
  "Loan Market may suspend or remove users or listings for safety reasons.",
];

/** Lender's own-compliance responsibility statement (used in lender-facing surfaces). */
export const LENDER_RESPONSIBILITY_STATEMENT =
  "As a lender or broker, you are solely responsible for your own licensing, advertising, " +
  "disclosure, interest-rate compliance, and all other legal obligations. Loan Market " +
  "does not verify, endorse, or arrange loans, and is not a party to any loan.";

/* ── Neutral lender / licence wording (conduit posture) ────────
 * Loan Market does NOT verify, vet, endorse, or confirm lenders. Lenders supply
 * their own licence number; the platform displays it as self-reported public
 * registry information and directs users to confirm it themselves with the
 * relevant regulator. These constants keep that language consistent everywhere
 * and deliberately avoid the words "verified"/"verification". This is practical
 * website wording, not legal advice.
 */

/** Short factual label used in place of "Verified lender". */
export const LICENSED_LENDER_LABEL = "Trusted lender/broker";

/** Caption shown next to a displayed licence number. */
export const LICENCE_SELF_REPORTED_NOTE =
  "Licence number provided by the lender/broker. Loan Market does not confirm it — check it " +
  "yourself with the regulator before dealing with anyone.";

/** Call-to-action text for the outbound regulator-lookup link. */
export const REGULATOR_CHECK_CTA = "Check this licence with the regulator";

/**
 * The PRIMARY licence-lookup link shown on lender/product cards. This is the
 * Ontario (FSRA/FSCO) public register search — it covers ONTARIO licences only.
 * Outbound link to the regulator's own site; Loan Market neither caches nor
 * confirms the data. For other provinces, see OTHER_PROVINCE_REGULATORS below.
 */
export const PRIMARY_REGULATOR_REGISTER_URL =
  "https://mbsweblist.fsco.gov.on.ca/agents.aspx";

/** Short note clarifying the primary link's scope. */
export const ONTARIO_ONLY_NOTE =
  "Ontario licences only. For other provinces, use the regulator links below.";

/**
 * Per-province / territory regulator licence-lookup resources, shown in the
 * "Other provinces" box so a borrower can confirm a licence with the right
 * regulator. These are outbound links to each regulator's own site — Loan
 * Market neither caches nor confirms the data. URLs should be reviewed
 * periodically as regulators occasionally move their pages.
 */
export const OTHER_PROVINCE_REGULATORS: { name: string; url: string }[] = [
  {
    name: "British Columbia — BC Financial Services Authority (BCFSA)",
    url: "https://www.bcfsa.ca/public-resources/check-licences-registrations",
  },
  {
    name: "Alberta — Real Estate Council of Alberta (RECA)",
    url: "https://www.reca.ca/find-a-professional-or-brokerage/",
  },
  {
    name: "Saskatchewan — Financial and Consumer Affairs Authority (FCAA)",
    url: "https://fcaa.gov.sk.ca/",
  },
  {
    name: "Manitoba — Manitoba Securities Commission",
    url: "https://www.mbsecurities.ca/",
  },
  {
    name: "Quebec — Autorité des marchés financiers (AMF)",
    url: "https://lautorite.qc.ca/en/general-public/registers",
  },
  {
    name: "New Brunswick — Financial and Consumer Services Commission (FCNB)",
    url: "https://www.fcnb.ca/en/check-registration",
  },
  {
    name: "Nova Scotia — Service Nova Scotia (mortgage regulation)",
    url: "https://beta.novascotia.ca/programs-and-services/mortgage-regulation",
  },
  {
    name: "Newfoundland & Labrador — Digital Government and Service NL",
    url: "https://www.gov.nl.ca/dgsnl/",
  },
  {
    name: "Other provinces & territories — find your regulator",
    url: "https://mortgageregulators.ca/",
  },
];

/**
 * What the platform tells users it does at the gate. Deliberately NOT a
 * verification claim: lenders self-attest, supply a licence number, and agree to
 * the rules; users confirm licences themselves.
 */
export const LENDER_INTAKE_NOTE =
  "Loan Market does not verify, vet, or endorse lenders/brokers. Lenders and brokers agree to the " +
  "platform rules and provide a licence number, which is shown as self-reported. " +
  "Always confirm a lender/broker's licence with the regulator yourself.";

/* ── Launch gating flags ──────────────────────────────
 * Early stage: licensed lenders only. Private-lender registration stays CLOSED
 * until after legal review. The code path for private lenders remains in place
 * but is gated behind this flag so it can be switched on later in one place.
 */
export const PRIVATE_LENDERS_ENABLED = false;

/** Lender types that may register while PRIVATE_LENDERS_ENABLED is false. */
export const LICENSED_LENDER_TYPES: LenderType[] = [
  "mortgage_broker",
  "mortgage_agent",
  "financing_company",
  "bank",
  "credit_union",
];

/**
 * Lender/Broker types that must supply a licence number at signup. Only mortgage
 * brokers and agents carry a personal/firm licence; banks, credit unions and
 * financing companies are authorized or registered instead and provide no
 * licence number here. Drives both the signup form (show/hide the field) and
 * the signup action (whether the field is required).
 */
export const LICENCE_REQUIRED_LENDER_TYPES: LenderType[] = [
  "mortgage_broker",
  "mortgage_agent",
];

/* ── Launch-phase business rules ─────────────────────────────── */
// DORMANT: the old weekly approved-contacts cap. Superseded by the daily cap
// below (migration 0009). Kept so existing imports don't break.
export const LENDER_FREE_CONTACTS_PER_WEEK = 5;
export const MESSAGE_RETENTION_MONTHS = 6;

/**
 * Daily anti-spam contact cap. Each account (borrower OR lender) can START up
 * to this many NEW contact requests per calendar day (America/Toronto).
 * Approving a request, or messaging inside a conversation that is already open,
 * never counts. Mirrors `platform_settings.daily_contact_limit` — change both
 * together. Enforced in the contact-request RPCs (migration 0009).
 */
export const DAILY_FREE_CONTACTS_PER_SIDE = 5;

/** Friendly, anti-spam wording shown when the daily contact cap is reached. */
export const DAILY_CONTACT_LIMIT_MESSAGE =
  "You've reached today's limit of " + DAILY_FREE_CONTACTS_PER_SIDE +
  " new contact requests. To keep the marketplace free of spam, each account can " +
  "start up to " + DAILY_FREE_CONTACTS_PER_SIDE + " new contacts per day. The limit " +
  "resets tomorrow — any conversations you've already opened stay open.";

/**
 * TEMPORARY pre-launch flag. When true, the public boards (Borrower requests &
 * Loan products) ALWAYS show the demo/example cards — even alongside real data —
 * so the site looks populated before launch. Set to FALSE at launch to restore
 * the real behaviour (demo cards show only when a board is otherwise empty).
 */
export const SHOW_DEMO_CARDS_ALWAYS = true;

/**
 * TEMPORARY: hide every public pricing/credits surface — the nav tab, the footer
 * link, the /pricing and /credits pages (they 404 while hidden), and the
 * pricing/credits wording on the marketing pages. The marketplace stays free for
 * both sides while this is false (the dormant payment/credits gates in
 * platform_settings remain off). Flip back to true to restore pricing.
 */
export const PRICING_VISIBLE = false;
/**
 * Borrower→lender listing-contact fee (the dormant Stage 13 "pay $5 to open
 * messaging" flow). Still wired in code (payment-actions.ts) but gated off by
 * the borrower_listing_contact_payment_enabled platform flag. Not shown on the
 * public pricing page, which now describes the lender credits model instead.
 */
export const BORROWER_LISTING_CONTACT_FEE_USD = 5;
/** The borrower→lender contact fee in cents (must match platform_settings). */
export const BORROWER_LISTING_CONTACT_FEE_CENTS = 500;
export const PAYMENT_CURRENCY = "cad";

/**
 * Mandatory wording shown wherever the borrower pays to open contact. Makes
 * explicit that the fee buys PLATFORM COMMUNICATION, not loan approval/financing.
 */
export const PAYMENT_FEE_DISCLAIMER =
  "Fee is charged to open platform communication, not to guarantee financing. " +
  "Loan Market does not lend, approve, or arrange loans.";

/* ── Credits system ──────────────────────────────────────────
 * Lenders spend CREDITS (not dollars) to contact a borrower. Credits are bought
 * in packs with money via Stripe. The whole flow stays dormant behind the
 * `lender_contact_credits_enabled` platform setting until Stripe is connected.
 */

/**
 * Credit packs the user can buy. Conversion baseline: $10 = 15 credits
 * (≈1.5 credits per dollar; ≈$0.667 per credit). Larger packs keep the same
 * straight-line rate. amount_cents is what Stripe charges.
 */
export const CREDIT_PACKS: { key: string; amountCents: number; credits: number; label: string }[] = [
  { key: "pack_10", amountCents: 1000, credits: 15, label: "$10 → 15 credits" },
  { key: "pack_20", amountCents: 2000, credits: 30, label: "$20 → 30 credits" },
  { key: "pack_50", amountCents: 5000, credits: 75, label: "$50 → 75 credits" },
  { key: "pack_100", amountCents: 10000, credits: 150, label: "$100 → 150 credits" },
];

/**
 * Per-category CREDIT cost for a lender to contact a borrower, keyed by the DB
 * loan_category enum. Converted from the dollar list at the pack rate
 * (~1.5 credits/$), rounded to clean numbers. MUST match the SQL
 * `contact_credit_cost()` function in migration 0007 — change both together.
 */
export const CONTACT_CREDIT_COST_BY_CATEGORY: Record<LoanCategory, number> = {
  personal: 25,            // Personal / small loan (~$15)
  debt_consolidation: 40,  // Debt consolidation (~$25)
  auto: 40,                // Auto loan (~$25)
  business: 60,            // Business loan (~$40)
  mortgage: 90,            // Mortgage / refinance (~$60)
  refinance: 90,           // Mortgage / refinance (~$60)
  home_equity: 120,        // Private / second mortgage (~$80)
  other: 25,               // Fallback to the smallest tier
};

/**
 * Display catalogue of per-category contact costs IN CREDITS, shown on the
 * (hidden) credits page. Fuller list than the DB enum — includes student and
 * construction tiers that collapse onto enum values when actually charged.
 */
export const CONTACT_CREDIT_PRICING: { label: string; credits: number }[] = [
  { label: "Personal / small loan", credits: 25 },
  { label: "Debt consolidation", credits: 40 },
  { label: "Auto loan", credits: 40 },
  { label: "Student loan", credits: 30 },
  { label: "Business loan", credits: 60 },
  { label: "Mortgage / refinance", credits: 90 },
  { label: "Private / second mortgage", credits: 120 },
  { label: "Construction / renovation loan", credits: 90 },
];

/** Wording shown wherever credits are spent or bought. */
export const CREDITS_FEE_DISCLAIMER =
  "Credits open platform communication, not loan approval or financing. " +
  "Loan Market does not lend, approve, or arrange loans.";

/**
 * Mandatory safety warning shown at the top of every message thread (and before
 * the first message). Wording is fixed by product/compliance.
 */
export const MESSAGING_SAFETY_WARNING =
  "Loan Market does not lend money, approve loans, verify loan terms, collect " +
  "documents, or arrange financing. Do not share SIN, bank login details, " +
  "passwords, or send upfront fees. You are responsible for your own due diligence.";

/**
 * The free launch period continues until BOTH of these milestones are reached.
 * Presentational only at this stage — no marketplace logic depends on it yet.
 */
export const LAUNCH_FREE_THRESHOLDS = {
  borrowerSignups: 100,
  licensedLenders: 30,
} as const;

/**
 * Per-category contact pricing for verified lenders in DOLLARS. SUPERSEDED on
 * the public site by the credits model (see CONTACT_CREDIT_PRICING). Retained
 * as a reference mapping for the dollar amounts the credit costs were derived
 * from; not displayed anywhere now.
 */
export const LENDER_CATEGORY_PRICING: { label: string; priceUsd: number }[] = [
  { label: "Personal loan / small loan", priceUsd: 15 },
  { label: "Debt consolidation", priceUsd: 25 },
  { label: "Auto loan", priceUsd: 25 },
  { label: "Student loan", priceUsd: 20 },
  { label: "Business loan", priceUsd: 40 },
  { label: "Mortgage / refinance", priceUsd: 60 },
  { label: "Private mortgage / second mortgage", priceUsd: 80 },
  { label: "Construction / renovation loan", priceUsd: 60 },
];

/** Loan categories shown on marketing pages (broader than the DB enum). */
export const MARKETING_LOAN_CATEGORIES: string[] = [
  "Personal & small loans",
  "Debt consolidation",
  "Auto loans",
  "Student loans",
  "Business loans",
  "Mortgage & refinance",
  "Private & second mortgage",
  "Construction & renovation",
];

/* ── Route paths (single source of truth for navigation) ─────── */
export const ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
  // Public marketing pages
  howItWorks: "/how-it-works",
  borrowers: "/borrowers",
  lenders: "/lenders",
  loanRequests: "/loan-requests",
  safety: "/safety",
  pricing: "/pricing",
  faq: "/faq",
  terms: "/terms",
  privacy: "/privacy",
  disclaimer: "/disclaimer",
  // Auth
  login: "/login",
  signup: "/signup",
  signupBorrower: "/signup/borrower",
  signupLender: "/signup/lender",
  // App areas
  borrower: "/borrower",
  borrowerPostRequest: "/borrower/post-request",
  borrowerMyRequests: "/borrower/my-requests",
  borrowerContactRequests: "/borrower/contact-requests",
  borrowerSettings: "/borrower/settings",
  lender: "/lender",
  lenderVerification: "/lender/verification",
  lenderContactRequests: "/lender/contact-requests",
  lenderProducts: "/lender/products",
  lenderPostProduct: "/lender/post-product",
  lenderSettings: "/lender/settings",
  loanProducts: "/loan-products",
  credits: "/credits",
  paymentSuccess: "/payment/success",
  paymentCancel: "/payment/cancel",
  admin: "/admin",
  adminLenders: "/admin/lenders",
  adminReports: "/admin/reports",
  messages: "/messages",
  borrowerDashboard: "/borrower/dashboard",
  lenderDashboard: "/lender/dashboard",
} as const;
