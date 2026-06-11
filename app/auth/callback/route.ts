/**
 * Email-confirmation callback.
 *
 * Supabase redirects here after a user clicks the confirmation link in their
 * email. We accept either confirmation style:
 *   - PKCE / OAuth: a `code` we exchange for a session (default email template).
 *   - Token hash:   a `token_hash` + `type` we verify (if the email template is
 *                   switched to the {{ .TokenHash }} form — browser-independent).
 *
 * On success a session cookie is set and we send the user to `next` (the
 * role-specific dashboard set at signup). On failure we bounce to /login with a
 * friendly message. This route is intentionally outside the middleware matcher,
 * so an as-yet-unauthenticated visitor can reach it.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const INVALID =
  "We couldn't finish confirmation automatically. Please try logging in — if you confirmed on another device it'll work; if the link expired, sign up again for a new one.";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const nextParam = searchParams.get("next") ?? "";

  // Open-redirect guard: only allow internal absolute paths.
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  const supabase = createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) redirect(`/login?error=${encodeURIComponent(INVALID)}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as
        | "signup"
        | "email"
        | "recovery"
        | "invite"
        | "email_change"
        | "magiclink",
      token_hash: tokenHash,
    });
    if (error) redirect(`/login?error=${encodeURIComponent(INVALID)}`);
  } else {
    redirect(`/login?error=${encodeURIComponent(INVALID)}`);
  }

  redirect(next);
}
