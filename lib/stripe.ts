/**
 * Stripe server client.
 *
 * Stripe isn't fully wired yet (the secret key goes in env before launch). To
 * keep the app building and running in the meantime, this returns `null` when
 * the secret key is absent — callers must handle that case and show "payments
 * not configured yet" rather than crashing.
 *
 * The `stripe` package is a dependency in package.json, so it's safe to import
 * at module load. Only the missing-KEY case needs guarding (done below).
 */
import Stripe from "stripe";

let cached: Stripe | null = null;

/** Returns a configured Stripe client, or null if STRIPE_SECRET_KEY is unset. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (cached) return cached;

  cached = new Stripe(key, {
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
