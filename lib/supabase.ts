/**
 * Supabase BROWSER client (for Client Components).
 *
 * Uses the public anon key, which is safe to expose to the browser.
 * Row Level Security (added in a later stage) is what actually protects data.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
