"use client";

/**
 * Report control: a small "Report" button that opens a modal with a reason
 * picker + optional description, posting to the shared submitReportAction.
 *
 * Exactly one target prop should be set (loanRequestId | lenderListingId |
 * conversationId). No identity of the reported party is needed or shown — the
 * server resolves the reported user from the target.
 */
import { useState } from "react";
import { submitReportAction } from "@/app/report-actions";
import { REPORT_REASONS } from "@/lib/constants";

type Target =
  | { loanRequestId: string; lenderListingId?: never; conversationId?: never }
  | { lenderListingId: string; loanRequestId?: never; conversationId?: never }
  | { conversationId: string; loanRequestId?: never; lenderListingId?: never };

type ReportButtonProps = Target & {
  /** Where the action redirects back to (current page). */
  returnTo: string;
  /** Optional label override; defaults to "Report". */
  label?: string;
};

export function ReportButton(props: ReportButtonProps) {
  const { returnTo, label = "Report" } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-600"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 21V4a1 1 0 0 1 1-1h10l-1.5 4L15 11H5" />
        </svg>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Report to Loan Market</h2>
            <p className="mt-1 text-sm text-slate-600">
              Tell us what&apos;s wrong. Our team reviews every report. Don&apos;t include
              sensitive personal information in your description.
            </p>

            <form action={submitReportAction} className="mt-4 space-y-4">
              <input type="hidden" name="return_to" value={returnTo} />
              {"loanRequestId" in props && props.loanRequestId && (
                <input type="hidden" name="loan_request_id" value={props.loanRequestId} />
              )}
              {"lenderListingId" in props && props.lenderListingId && (
                <input type="hidden" name="lender_listing_id" value={props.lenderListingId} />
              )}
              {"conversationId" in props && props.conversationId && (
                <input type="hidden" name="conversation_id" value={props.conversationId} />
              )}

              <div>
                <label htmlFor="report-reason" className="mb-1 block text-sm font-medium text-slate-700">
                  Reason
                </label>
                <select
                  id="report-reason"
                  name="reason"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  <option value="" disabled>
                    Select a reason
                  </option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="report-description" className="mb-1 block text-sm font-medium text-slate-700">
                  Details (optional)
                </label>
                <textarea
                  id="report-description"
                  name="description"
                  rows={3}
                  maxLength={1000}
                  placeholder="Add any helpful context."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
                >
                  Submit report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
