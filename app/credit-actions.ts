"use server";

/**
 * Credit-pack purchase: start a Stripe Checkout session to buy a pack of
 * credits. On success the webhook tops up the wallet via add_credits_for_purchase.
 *
 * Credits buy PLATFORM COMMUNICATION (a lender spending credits to contact a
 * borrower), never loan approval. No contact info is touched here. If Stripe
 * isn't configured yet, we fail gracefully with a clear message.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getStripe, appBaseUrl } from "@/lib/stripe";
import {
  ROUTES,
  PAYMENT_CURRENCY,
  CREDIT_PACKS,
  CREDITS_FEE_DISCLAIMER,
} from "@/lib/constants";

function backWith(key: "message" | "error", text: string): never {
  redirect(`${ROUTES.credits}?${key}=${encodeURIComponent(text)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function startCreditPurchaseAction(formData: FormData): Promise<void> {
  const packKey = str(formData, "pack_key");
  const pack = CREDIT_PACKS.find((p) => p.key === packKey);
  if (!pack) backWith("error", "Unknown credit pack.");

  const stripe = getStripe();
  if (!stripe) {
    backWith(
      "error",
      "Payments aren't set up yet. Credit purchases will open once payment is enabled."
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const base = appBaseUrl();
  let url: string | null = null;
  try {
    const session = await stripe!.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: PAYMENT_CURRENCY,
            unit_amount: pack!.amountCents,
            product_data: {
              name: `${pack!.credits} Loan Market credits`,
              description: CREDITS_FEE_DISCLAIMER,
            },
          },
        },
      ],
      client_reference_id: user.id,
      metadata: {
        kind: "credit_pack",
        user_id: user.id,
        credits: String(pack!.credits),
        pack_key: pack!.key,
      },
      success_url: `${base}${ROUTES.paymentSuccess}?kind=credits&credits=${pack!.credits}`,
      cancel_url: `${base}${ROUTES.paymentCancel}?kind=credits`,
    });
    url = session.url;
  } catch {
    backWith("error", "Could not start checkout. Please try again.");
  }

  if (!url) backWith("error", "Could not start checkout. Please try again.");
  redirect(url!);
}
