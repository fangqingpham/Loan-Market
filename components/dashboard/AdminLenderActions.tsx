"use client";

/**
 * Admin verification action buttons for a lender. Approve is a one-click form;
 * Reject and Suspend require a typed reason AND a confirmation step before they
 * submit (the spec asks for confirmation before suspend/reject).
 */
import { useState } from "react";
import {
  approveLenderAction,
  rejectLenderAction,
  suspendLenderAction,
  resetLenderToPendingAction,
} from "@/app/(admin)/admin/lenders/actions";

type Mode = null | "approve" | "reject" | "suspend" | "reset";

export function AdminLenderActions({
  lenderId,
  status,
}: {
  lenderId: string;
  status: string;
}) {
  const [mode, setMode] = useState<Mode>(null);

  // Normalize so an unexpected/empty value never accidentally reads as verified.
  const s = (status ?? "").trim();
  const isVerified = s === "verified";
  const isRejected = s === "rejected";
  const isSuspended = s === "suspended";

  const needsReason = mode === "reject" || mode === "suspend";
  const panelAction =
    mode === "approve"
      ? approveLenderAction
      : mode === "reject"
        ? rejectLenderAction
        : mode === "suspend"
          ? suspendLenderAction
          : resetLenderToPendingAction;

  const verb =
    mode === "approve"
      ? "approve"
      : mode === "reject"
        ? "reject"
        : mode === "suspend"
          ? "suspend"
          : "set back to pending";

  return (
    <div className="space-y-4">
      {/* Primary action buttons — all plain buttons that open a confirm panel. */}
      <div className="flex flex-wrap gap-2">
        {!isVerified && (
          <button
            type="button"
            onClick={() => setMode("approve")}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-verified-600 px-4 text-sm font-medium text-white hover:bg-verified-700"
          >
            Approve &amp; activate
          </button>
        )}

        {!isRejected && (
          <button
            type="button"
            onClick={() => setMode("reject")}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-red-300 px-4 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Reject…
          </button>
        )}

        {!isSuspended && (
          <button
            type="button"
            onClick={() => setMode("suspend")}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-red-300 px-4 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Suspend…
          </button>
        )}

        {(isRejected || isSuspended) && (
          <button
            type="button"
            onClick={() => setMode("reset")}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Set back to pending
          </button>
        )}
      </div>

      {/* Single confirm panel, reused by every action. The server action is
          bound to the form here (rendered only after a click), and reject /
          suspend additionally require a typed reason. */}
      {mode && (
        <form
          action={panelAction}
          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <input type="hidden" name="id" value={lenderId} />
          <p className="text-sm font-medium text-slate-800">
            Confirm: {verb} this lender?
          </p>

          {needsReason && (
            <label className="block text-sm text-slate-700">
              Reason (required, shown to the lender)
              <textarea
                name="reason"
                required
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                placeholder={
                  mode === "reject"
                    ? "e.g. Could not confirm the business details provided."
                    : "e.g. Multiple borrower reports; pausing pending review."
                }
              />
            </label>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setMode(null)}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
