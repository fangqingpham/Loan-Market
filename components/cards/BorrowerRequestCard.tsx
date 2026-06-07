import Link from "next/link";
import { Card, CardContent, Badge, Icon } from "@/components/ui";
import {
  LOAN_CATEGORIES,
  PROVINCES,
  SECURED_STATUS_OPTIONS,
  LISTING_STATUS_LABELS,
  ROUTES,
} from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import { sanitizePublicText } from "@/lib/privacy/sanitizePublicText";
import {
  delistLoanRequestAction,
  relistLoanRequestAction,
} from "@/app/(borrower)/borrower/actions";
import type { Database } from "@/types/database";

type LoanRequestRow = Database["public"]["Tables"]["loan_requests"]["Row"];

const categoryLabel = Object.fromEntries(LOAN_CATEGORIES.map((c) => [c.value, c.label]));
const provinceLabel = Object.fromEntries(PROVINCES.map((p) => [p.value, p.label]));
const securedLabel = Object.fromEntries(SECURED_STATUS_OPTIONS.map((s) => [s.value, s.label]));

function StatusBadge({ status }: { status: LoanRequestRow["status"] }) {
  if (status === "active") return <Badge tone="verified">{LISTING_STATUS_LABELS.active}</Badge>;
  if (status === "delisted") return <Badge tone="neutral">{LISTING_STATUS_LABELS.delisted}</Badge>;
  return <Badge tone="warning">{LISTING_STATUS_LABELS.removed_by_admin}</Badge>;
}

/** A line of small "label: value" meta chips for the populated preview fields. */
function Meta({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
      <span className="text-slate-400">{label}:</span> {value}
    </span>
  );
}

export function BorrowerRequestCard({ request }: { request: LoanRequestRow }) {
  const editHref = `${ROUTES.borrowerMyRequests}/${request.id}/edit`;
  const isRemoved = request.status === "removed_by_admin";
  const borrowerNote = sanitizePublicText(request.borrower_note);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {categoryLabel[request.loan_category] ?? request.loan_category}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Posted {formatDate(request.created_at)}
              {request.updated_at !== request.created_at &&
                ` · Updated ${formatDate(request.updated_at)}`}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Meta label="Province" value={provinceLabel[request.province ?? ""] ?? request.province} />
          <Meta label="City" value={request.city} />
          <Meta label="Amount" value={request.amount_range} />
          <Meta label="Purpose" value={request.purpose_category} />
          <Meta label="Secured" value={securedLabel[request.secured_status ?? ""] ?? null} />
        </div>

        {(request.credit_score_range ||
          request.income_range ||
          request.employment_type ||
          request.loan_term_range ||
          request.expected_interest_range ||
          borrowerNote) && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Icon name="badge-check" className="h-3.5 w-3.5 text-verified-700" />
              Visible to lenders/brokers only
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Meta label="Credit" value={request.credit_score_range} />
              <Meta label="Income" value={request.income_range} />
              <Meta label="Employment" value={request.employment_type} />
              <Meta label="Term" value={request.loan_term_range} />
              <Meta label="Interest" value={request.expected_interest_range} />
            </div>
            {borrowerNote && (
              <p className="mt-2 text-sm text-slate-600">{borrowerNote}</p>
            )}
          </div>
        )}

        {/* Management actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {isRemoved ? (
            <p className="text-sm text-slate-500">
              This request was removed by an admin and can no longer be edited.
            </p>
          ) : (
            <>
              <Link
                href={editHref}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                <Icon name="document" className="h-4 w-4" />
                Edit
              </Link>

              {request.status === "active" ? (
                <form action={delistLoanRequestAction}>
                  <input type="hidden" name="id" value={request.id} />
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Icon name="eye-off" className="h-4 w-4" />
                    Delist
                  </button>
                </form>
              ) : (
                <form action={relistLoanRequestAction}>
                  <input type="hidden" name="id" value={request.id} />
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    <Icon name="check" className="h-4 w-4" />
                    Relist
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
