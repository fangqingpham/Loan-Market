/**
 * Stripe server client.
 *
 * Stripe isn't connected yet (keys go in .env later, before launch). To keep the
 * app building and running in the meantime, this returns `null` when the secret
 * key is absent — callers must handle that case and show "payments not
 * configured yet" rather than crashing.
 *
 * The `stripe` package is imported lazily (require inside the function) so that
 * environments without it installed, or without a key, don't fail at module load.
 */
import type Stripe from "stripe";

let cached: Stripe | null = null;

/** Returns a configured Stripe client, or null if STRIPE_SECRET_KEY is unset. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (cached) return cached;

  // Lazy require so a missing package/key never breaks module load or build.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const StripeCtor = require("stripe") as typeof import("stripe");
  cached = new StripeCtor(key, {
    // Pin a stable API version; adjust when you upgrade the dashboard version.
    apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
    appInfo: { name: "Loan Market" },
  });
  return cached;
}

/** True when Stripe is configured (secret key present). */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** The app's base URL for building Checkout success/cancel URLs. */
export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}
