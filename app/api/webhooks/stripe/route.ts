/**
 * Stripe webhook handler — the AUTHORITATIVE payment confirmation.
 *
 * On `checkout.session.completed` (a successful payment) we call
 * `mark_contact_request_paid` via the SERVICE-ROLE client, which:
 *   - re-checks the 24h window (expired → marks expired, no conversation),
 *   - flips the request to approved + paid,
 *   - inserts a payments row,
 *   - opens the conversation.
 *
 * Security:
 *   - The Stripe signature is verified against STRIPE_WEBHOOK_SECRET; an
 *     unverified body is rejected. This is why we read the RAW body.
 *   - We never trust the browser/success page to confirm payment — only this
 *     signed webhook opens messaging. A failed/abandoned payment fires no
 *     completed event, so no conversation opens.
 *
 * If Stripe or the service-role key isn't configured yet, we respond 200 with a
 * note (so Stripe doesn't hammer retries) but take no action.
 */
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";

// Stripe needs the raw, unparsed body to verify the signature.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    // Not configured yet — acknowledge so Stripe doesn't retry forever.
    return NextResponse.json({ received: true, note: "stripe-not-configured" }, { status: 200 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature failed: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only act on actually-paid sessions.
    if (session.payment_status === "paid") {
      const kind = session.metadata?.kind;
      const admin = createAdminClient();

      if (admin && kind === "credit_pack") {
        // Credit-pack purchase -> top up the buyer's wallet (idempotent on session id).
        const userId = session.metadata?.user_id || session.client_reference_id || undefined;
        const credits = Number(session.metadata?.credits ?? 0);
        if (userId && credits > 0) {
          const { error } = await admin.rpc("add_credits_for_purchase", {
            p_user: userId,
            p_credits: credits,
            p_stripe_session_id: session.id,
          } as never);
          if (error) console.error("add_credits_for_purchase failed:", error.message);
        }
      } else if (admin) {
        // Legacy single-contact fee path (kept for back-compat; dormant while the
        // borrower listing-contact payment flag is off).
        const requestId =
          (session.metadata && session.metadata.contact_request_id) ||
          (session.client_reference_id ?? undefined);
        if (requestId) {
          const { error } = await admin.rpc("mark_contact_request_paid", {
            p_request_id: requestId,
            p_stripe_session_id: session.id,
          } as never);
          if (error) console.error("mark_contact_request_paid failed:", error.message);
        }
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
