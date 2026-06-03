"use client";

/**
 * "Contact This Lender" control for a product card.
 *
 * - Logged-in borrower with no active request → a working submit button that
 *   creates a borrower→lender contact request (free path; lender approves).
 * - Borrower who already has an active request → a status pill (no duplicate).
 * - Logged-out viewer → a prompt to sign in as a borrower.
 * - Lender/admin viewer → a neutral note (this button is for borrowers).
 *
 * No lender phone/email/website is ever present in this component.
 */
import Link from "next/link";
import { requestListingContactAction } from "@/app/(borrower)/borrower/listing-contact-actions";
import { ROUTES } from "@/lib/constants";
import type { ContactRequestStatus } from "@/types/database";

const PILL: Record<string, { label: string; className: string }> = {
  pending: { label: "Contact requested · pending", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Contact approved", className: "bg-verified-100 text-verified-700" },
  approved_pending_payment: { label: "Approved · payment needed", className: "bg-amber-100 text-amber-800" },
};

export function ContactLenderButton({
  listingId,
  viewerRole,
  existingStatus,
  returnTo,
}: {
  listingId: string;
  /** "borrower" | "lender" | "admin" | null (logged out) */
  viewerRole: "borrower" | "lender" | "admin" | null;
  existingStatus?: ContactRequestStatus | null;
  returnTo?: string;
}) {
  // Already has an active request → show its state, no duplicate button.
  if (existingStatus && existingStatus in PILL) {
    const pill = PILL[existingStatus];
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}>
        {pill.label}
      </span>
    );
  }

  if (viewerRole === null) {
    return (
      <Link
        href={ROUTES.login}
        className="inline-flex h-9 items-center justify-center rounded-xl border border-brand-300 px-4 text-sm font-medium text-brand-700 hover:bg-brand-50"
      >
        Contact
      </Link>
    );
  }

  if (viewerRole !== "borrower") {
    return (
      <span className="text-xs text-slate-400">Borrowers can request contact here.</span>
    );
  }

  return (
    <form action={requestListingContactAction}>
      <input type="hidden" name="lender_listing_id" value={listingId} />
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
