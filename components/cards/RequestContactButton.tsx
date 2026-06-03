"use client";

/**
 * Request-contact control shown on a loan-request card for a VERIFIED lender.
 *
 * - No existing request → a "Request contact" submit button.
 * - Existing request → a status pill (Pending / Approved / Declined / Cancelled)
 *   instead of the button, so a lender can't send duplicates (the DB also
 *   blocks duplicates; this is the matching UI state).
 *
 * The button posts to the server action; all checks (verified, no dupes) run in
 * the database. No contact info is present in this component at all.
 */
import { requestContactAction } from "@/app/(lender)/lender/contact-actions";
import type { ContactRequestStatus } from "@/types/database";

const PILL: Record<string, { label: string; className: string }> = {
  pending: { label: "Contact requested · pending", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Contact approved", className: "bg-verified-100 text-verified-700" },
  approved_pending_payment: { label: "Approved", className: "bg-verified-100 text-verified-700" },
  rejected: { label: "Contact declined", className: "bg-slate-100 text-slate-600" },
  cancelled: { label: "Request cancelled", className: "bg-slate-100 text-slate-600" },
  expired: { label: "Request expired", className: "bg-slate-100 text-slate-600" },
};

export function RequestContactButton({
  loanRequestId,
  existingStatus,
  returnTo,
}: {
  loanRequestId: string;
  existingStatus?: ContactRequestStatus | null;
  returnTo?: string;
}) {
  // An active request exists → show its state, no button (prevents duplicates).
  if (existingStatus && existingStatus in PILL && existingStatus !== "cancelled" && existingStatus !== "rejected" && existingStatus !== "expired") {
    const pill = PILL[existingStatus];
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}>
        {pill.label}
      </span>
    );
  }

  // A previously cancelled/rejected/expired request still allows a new one.
  return (
    <form action={requestContactAction}>
      <input type="hidden" name="loan_request_id" value={loanRequestId} />
      {returnTo && <input type="hidden" name="return_to" value={returnTo} />}
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
      >
        Contact
      </button>
    </form>
  );
}
