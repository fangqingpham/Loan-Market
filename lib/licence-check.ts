/**
 * Lender licence / registration verification — BACKEND STUB.
 *
 * ⚠️  THIS IS A PLACEHOLDER. It does NOT contact any real registry yet.
 *
 * Intended production behaviour (to be implemented later): when a LICENSED
 * lender (mortgage broker/agent, financing company, bank, credit union) signs
 * up or updates their licence number, a backend process — e.g. an automated
 * agent or a provincial registry API such as FSRA's public mortgage-broker
 * lookup in Ontario — checks the licence and returns one of:
 *   - "verified"   licence found and active
 *   - "suspended"  licence found but suspended/inactive
 *   - "not_found"  no matching licence in the registry
 *
 * Until that integration exists, this stub returns "pending" so NOTHING is
 * ever auto-verified on the strength of an unverified, user-entered number.
 * An admin still grants the final `verification_status`. Returning "pending"
 * keeps the lender locked out of marketplace tools until a real check (or an
 * admin) clears them — which is the safe default.
 *
 * Private lenders never reach this code path; their licence status is
 * "not_applicable" and they go through the verification FORM instead.
 */
import type { LicenceVerificationStatus, LenderType } from "@/types/database";

export interface LicenceCheckResult {
  status: LicenceVerificationStatus;
  message: string | null;
  checkedAt: string | null;
}

/** Lender types that carry a licence/registration we can check. */
const LICENSED_TYPES: LenderType[] = [
  "mortgage_broker",
  "mortgage_agent",
  "financing_company",
  "bank",
  "credit_union",
];

export function lenderTypeRequiresLicence(type: LenderType | null): boolean {
  return type !== null && LICENSED_TYPES.includes(type);
}

/**
 * STUB: pretend to check a licence number against a registry.
 *
 * Replace the body with a real registry/agent call. The function signature and
 * return shape are stable, so swapping the implementation won't ripple outward.
 */
export async function checkLenderLicence(params: {
  lenderType: LenderType | null;
  licenceNumber: string | null;
  provinces: string[];
}): Promise<LicenceCheckResult> {
  const { lenderType, licenceNumber } = params;

  // Private / "other" lenders don't have a licence to check here.
  if (!lenderTypeRequiresLicence(lenderType)) {
    return { status: "not_applicable", message: null, checkedAt: null };
  }

  // A licensed lender that didn't provide a number can't be checked.
  if (!licenceNumber || !licenceNumber.trim()) {
    return {
      status: "not_found",
      message:
        "We were unable to verify your license because no licence number was provided. " +
        "Please update your licence number to post ads or contact borrowers.",
      checkedAt: new Date().toISOString(),
    };
  }

  // ── REAL CHECK GOES HERE ──────────────────────────────────────────────
  // e.g. const result = await fsraLookup(licenceNumber, provinces);
  // Map the registry result to "verified" | "suspended" | "not_found" and a
  // user-facing message. For now we defer to manual/admin review:
  return {
    status: "pending",
    message: "Your licence is queued for verification. We'll update your status shortly.",
    checkedAt: null,
  };
}

/** The message shown to a lender whose licence check failed (suspended/not found). */
export function licenceFailureMessage(status: LicenceVerificationStatus): string | null {
  if (status === "suspended" || status === "not_found") {
    return (
      "We were unable to verify your license. Please update your licence details to be " +
      "able to post ads or contact borrowers."
    );
  }
  return null;
}
