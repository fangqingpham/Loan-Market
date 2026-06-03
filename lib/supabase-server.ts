/**
 * Supabase SERVER client (for Server Components, Route Handlers, Server Actions).
 *
 * Reads/writes the auth cookie via Next.js `cookies()`. When called from a
 * Server Component (read-only context) the cookie write is a no-op, which is
 * expected and handled below.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore. Cookie refresh
            // is handled by middleware (added when auth is built).
          }
        },
      },
    }
  );
}
