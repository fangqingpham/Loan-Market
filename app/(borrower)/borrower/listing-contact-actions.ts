"use server";

/**
 * Borrower "Contact This Lender" action for a product listing.
 *
 * Calls the existing SECURITY DEFINER RPC `request_listing_contact`, which:
 *   - requires the caller to be a borrower,
 *   - blocks duplicate active requests for the same listing,
 *   - creates a `borrower_to_lender` contact_request.
 * Because `platform_settings.borrower_listing_contact_payment_enabled` is false
 * during launch, the request is created with payment_required = false (free
 * path). The lender then approves/declines it from their contact requests; a
 * conversation opens on approval. NO lender contact info is exposed anywhere.
 *
 * If payment is enabled later, this same RPC will set payment_required = true
 * and the approval flow will route through the (not-yet-built) payment step.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { getCurrentUserRole } from "@/lib/auth";
import { ROUTES, DAILY_CONTACT_LIMIT_MESSAGE } from "@/lib/constants";

const PRODUCTS = ROUTES.loanProducts;

function backWith(path: string, key: "message" | "error", text: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(text)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function friendly(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("daily_contact_limit_reached")) return DAILY_CONTACT_LIMIT_MESSAGE;
  if (m.includes("only borrowers")) return "Only borrowers can contact a lender about a product.";
  if (m.includes("already exists")) return "You already have an active contact request for this product.";
  if (m.includes("not found") || m.includes("not active")) return "That product is no longer available.";
  if (m.includes("not allowed")) return "Contact is not allowed for this product.";
  if (m.includes("borrower profile required")) return "Please finish setting up your borrower profile first.";
  return "Could not send your contact request. Please try again.";
}

export async function requestListingContactAction(formData: FormData): Promise<void> {
  const listingId = str(formData, "lender_listing_id");
  const returnTo = str(formData, "return_to") || PRODUCTS;
  if (!listingId) backWith(returnTo, "error", "Missing product.");

  // Friendly gate before hitting the RPC (the RPC also enforces this).
  const role = await getCurrentUserRole();
  if (role === null) {
    // Not signed in — send to login.
    redirect(ROUTES.login);
  }
  if (role !== "borrower") {
    backWith(returnTo, "error", "Only borrowers can contact a lender about a product.");
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("request_listing_contact", {
    p_lender_listing_id: listingId,
  } as never);
  if (error) backWith(returnTo, "error", friendly(error.message));

  revalidatePath(ROUTES.borrowerContactRequests);
  backWith(
    returnTo,
    "message",
    "Contact request sent. The lender will be notified to approve or decline."
  );
}
