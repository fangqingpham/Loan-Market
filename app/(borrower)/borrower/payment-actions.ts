"use server";

/**
 * Borrower payment action: start a Stripe Checkout session to open messaging on
 * an already-APPROVED listing contact request.
 *
 * Sequence (matches the DB design):
 *   1. Borrower requests contact   -> request_listing_contact
 *   2. Lender approves             -> approve_contact_request => 'approved_pending_payment'
 *   3. Borrower pays (THIS action) -> Stripe Checkout
 *   4. Stripe webhook confirms     -> mark_contact_request_paid => conversation opens
 *
 * The fee opens platform communication only — never loan approval. No lender
 * contact info is touched here. If Stripe isn't configured yet, we fail
 * gracefully with a clear message instead of crashing.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getStripe, appBaseUrl } from "@/lib/stripe";
import {
  ROUTES,
  PAYMENT_CURRENCY,
  PAYMENT_FEE_DISCLAIMER,
  BORROWER_LISTING_CONTACT_FEE_CENTS,
} from "@/lib/constants";

const CR = ROUTES.borrowerContactRequests;

function backWith(key: "message" | "error", text: string): never {
  redirect(`${CR}?${key}=${encodeURIComponent(text)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function startListingPaymentAction(formData: FormData): Promise<void> {
  const requestId = str(formData, "request_id");
  if (!requestId) backWith("error", "Missing request id.");

  const stripe = getStripe();
  if (!stripe) {
    // Stripe not connected yet — don't pretend it worked.
    backWith(
      "error",
      "Payments aren't set up yet. Please check back shortly — messaging will open once payment is enabled."
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  // Read the request. RLS (cr_select) restricts to requester/recipient/admin, so
  // the borrower can only load their own request. Re-check state + ownership.
  const { data } = await supabase
    .from("contact_requests")
    .select(
      "id, requester_user_id, status, payment_required, payment_status, amount_cents, expires_at"
    )
    .eq("id", requestId)
    .maybeSingle();
  const cr = data as
    | {
        id: string;
        requester_user_id: string;
        status: string;
        payment_required: boolean;
        payment_status: string;
        amount_cents: number;
        expires_at: string | null;
      }
    | null;

  if (!cr || cr.requester_user_id !== user.id) backWith("error", "Request not found.");
  if (!cr!.payment_required) backWith("error", "This request doesn't require payment.");
  if (cr!.status !== "approved_pending_payment") {
    backWith("error", "This request isn't awaiting payment.");
  }
  if (cr!.expires_at && new Date(cr!.expires_at) < new Date()) {
    backWith("error", "The payment window for this request has expired.");
  }

  const amount = cr!.amount_cents || BORROWER_LISTING_CONTACT_FEE_CENTS;
  const base = appBaseUrl();

  // Create the Checkout session. We carry the contact_request id in metadata so
  // the webhook can mark exactly this request paid. The success URL also gets
  // the session id for a best-effort confirmation fallback.
  let url: string | null = null;
  try {
    const session = await stripe!.checkout.sessions.create({
      mode: "payment",
      // The borrower's email isn't collected here; Stripe will ask at checkout.
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: PAYMENT_CURRENCY,
            unit_amount: amount,
            product_data: {
              name: "Open platform communication",
              description: PAYMENT_FEE_DISCLAIMER,
            },
          },
        },
      ],
      client_reference_id: cr!.id,
      metadata: { contact_request_id: cr!.id, kind: "listing_contact_fee" },
      success_url: `${base}${ROUTES.paymentSuccess}?session_id={CHECKOUT_SESSION_ID}&request_id=${cr!.id}`,
      cancel_url: `${base}${ROUTES.paymentCancel}?request_id=${cr!.id}`,
    });
    url = session.url;
  } catch {
    backWith("error", "Could not start checkout. Please try again.");
  }

  if (!url) backWith("error", "Could not start checkout. Please try again.");
  redirect(url!);
}
