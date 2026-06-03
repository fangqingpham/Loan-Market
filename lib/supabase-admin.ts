/**
 * Supabase SERVICE-ROLE client — server-only, NEVER import into client code.
 *
 * Used by the Stripe webhook to call `mark_contact_request_paid` with
 * service_role rights (the webhook has no user session/cookie). The service key
 * bypasses RLS, so this module must only ever be imported by trusted server
 * routes (the webhook handler).
 *
 * Returns null if the env vars are absent, so the app builds without them.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
