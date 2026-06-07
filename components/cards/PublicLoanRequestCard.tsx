import Link from "next/link";
import { Card, CardContent, Badge, Icon } from "@/components/ui";
import {
  LOAN_CATEGORIES,
  PROVINCES,
  SECURED_STATUS_OPTIONS,
  ROUTES,
} from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import { RequestContactButton } from "./RequestContactButton";
import { ReportButton } from "@/components/safety";
import { sanitizePublicText } from "@/lib/privacy/sanitizePublicText";
import type { ContactRequestStatus } from "@/types/database";

const categoryLabel = Object.fromEntries(LOAN_CATEGORIES.map((c) => [c.value, c.label]));
const provinceLabel = Object.fromEntries(PROVINCES.map((p) => [p.value, p.label]));
const securedLabel = Object.fromEntries(SECURED_STATUS_OPTIONS.map((s) => [s.value, s.label]));

/** The columns visible on the public preview view (no contact info). */
export type PublicPreview = {
  id: string;
  loan_category: string;
  province: string | null;
  city: string | null;
  amount_range: string | null;
  purpose_category: string | null;
  secured_status: string | null;
  loan_term_range: string | null;
  created_at: string;
  /** Borrower's self-chosen username/nickname. NOT their legal name. */
  display_name: string | null;
};

/** Extra columns visible only to licensed (signed-in) lenders. */
export type LenderExtra = {
  credit_score_range: string | null;
  income_range: string | null;
  employment_type: string | null;
  expected_interest_range: string | null;
  borrower_note: string | null;
};

function Meta({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-600">
      <span className="text-slate-400">{label}:</span> {value}
    </span>
  );
}

interface PublicLoanRequestCardProps {
  preview: PublicPreview;
  /** When set, the card renders the expanded licensed-lender section. */
  extra?: LenderExtra;
  /**
   * When true, the viewer is a signed-in lender and the Contact button performs
   * the real request-contact action. `contactStatus` carries any existing
   * request's status so the control shows the right state (no duplicates).
   */
  canRequestContact?: boolean;
  contactStatus?: ContactRequestStatus | null;
  /** When set, shows a Report control that redirects back here after submit. */
  reportReturnTo?: string;
  /** Illustrative placeholder card — shows a sample (disabled) Contact button. */
  demo?: boolean;
}

/**
 * A single loan-request card for the public board. Renders the public-preview
 * fields for everyone, the verified-lender-only data block when `extra` is
 * present, and ALWAYS a bottom Contact row. Contact info NEVER appears here —
 * the loan_requests table has no contact columns and the preview view exposes
 * even fewer fields.
 */
export function PublicLoanRequestCard({
  preview,
  extra,
  canRequestContact,
  contactStatus,
  reportReturnTo,
  demo,
}: PublicLoanRequestCardProps) {
  const location = [
    preview.city,
    provinceLabel[preview.province ?? ""] ?? preview.province,
  ]
    .filter(Boolean)
    .join(", ");

  const categoryName = categoryLabel[preview.loan_category] ?? preview.loan_category;
  const safeBorrowerNote = sanitizePublicText(extra?.borrower_note);
  // Short, stable reference so a lender can refer to a specific request.
  const ref = preview.id.slice(0, 8).toUpperCase();
  // The borrower's chosen handle, or a neutral fallback that never exposes identity.
  const handle = preview.display_name?.trim() || "Anonymous borrower";

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col space-y-3">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon name="user" className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">{handle}</h3>
                {demo && <Badge tone="neutral">Example</Badge>}
              </div>
              <p className="text-sm text-slate-500">
                {categoryName} · Request #{ref}
              </p>
            </div>
          </div>
          <span className="flex flex-col items-end gap-1">
            <span className="text-sm text-slate-500">
              {formatDate(preview.created_at)}
            </span>
            {reportReturnTo && !demo && (
              <ReportButton loanRequestId={preview.id} returnTo={reportReturnTo} />
            )}
          </span>
        </div>

        {/* Public preview chips */}
        <div className="flex flex-wrap gap-2">
          {location && <Meta label="Location" value={location} />}
          <Meta label="Amount" value={preview.amount_range} />
          <Meta label="Purpose" value={preview.purpose_category} />
          <Meta
            label="Secured"
            value={securedLabel[preview.secured_status ?? ""] ?? null}
          />
          <Meta label="Term" value={preview.loan_term_range} />
        </div>

        {/* Expanded lender-only data block (no button here) */}
        {extra && !demo && (
          <div className="rounded-xl border border-verified-500/20 bg-verified-100/30 p-3">
            <div className="flex items-center gap-1.5 text-sm font-medium text-verified-700">
              <Icon name="badge-check" className="h-3.5 w-3.5" />
              Lender/Broker view
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Meta label="Credit" value={extra.credit_score_range} />
              <Meta label="Income" value={extra.income_range} />
              <Meta label="Employment" value={extra.employment_type} />
              <Meta label="Interest" value={extra.expected_interest_range} />
            </div>
            {safeBorrowerNote && (
              <p className="mt-2 text-base text-slate-600">{safeBorrowerNote}</p>
            )}
          </div>
        )}

        {/* Bottom contact row — always present, pinned to the bottom */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-500">
            Contact details stay hidden until the borrower approves.
          </span>
          {demo ? (
            <button
              type="button"
              disabled
              title="Example only"
              className="inline-flex h-9 shrink-0 cursor-not-allowed items-center justify-center rounded-xl bg-brand-600/50 px-4 text-sm font-medium text-white"
            >
              Contact
            </button>
          ) : canRequestContact ? (
            <RequestContactButton
              loanRequestId={preview.id}
              existingStatus={contactStatus}
            />
          ) : (
            <Link
              href={ROUTES.login}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-brand-300 px-4 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              Contact
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
