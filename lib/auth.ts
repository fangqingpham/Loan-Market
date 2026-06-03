/**
 * Server-side auth helpers. Single, consistent place to read the current user,
 * their role (from the `profiles` table), and lender verification status.
 */
import { createClient } from "@/lib/supabase-server";
import type { Database, UserRole, LenderVerificationStatus } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type LenderRow = Database["public"]["Tables"]["lender_profiles"]["Row"];

/** Returns the currently signed-in Supabase user, or null. */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export type CurrentProfile = {
  userId: string;
  role: UserRole;
  fullName: string | null;
  email: string | null;
};

/** Returns the current user's profile (role is the source of truth), or null. */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("user_id", user.id)
    .maybeSingle();
  // Some @supabase/postgrest-js versions widen column selects to `never` at the
  // type level; assert the shape we actually selected from the profiles row.
  const row = data as Pick<ProfileRow, "role" | "full_name" | "email"> | null;
  if (!row) return null;
  return { userId: user.id, role: row.role, fullName: row.full_name, email: row.email };
}

/** Convenience: the current user's role, or null if signed out / no profile. */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const profile = await getCurrentProfile();
  return profile?.role ?? null;
}

/** True only when the current user has the admin role. */
export async function isAdmin(): Promise<boolean> {
  return (await getCurrentUserRole()) === "admin";
}

/**
 * Returns the current user's `borrower_profiles.id` (the FK used by
 * `loan_requests.borrower_id`), or null if there isn't one. Note this is the
 * borrower profile row id, NOT the auth user id.
 */
export async function getBorrowerProfileId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("borrower_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const row = data as { id: string } | null;
  return row?.id ?? null;
}

/** Returns the current lender's verification status, or null if not a lender. */
export async function getLenderVerificationStatus(): Promise<LenderVerificationStatus | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("lender_profiles")
    .select("verification_status")
    .eq("user_id", user.id)
    .maybeSingle();
  const row = data as Pick<LenderRow, "verification_status"> | null;
  return row?.verification_status ?? null;
}

/**
 * Returns the current user's full lender_profiles row, or null if not a lender.
 * Used by the lender dashboard, verification form, and settings page. RLS
 * (`lp_select`) restricts this to the owner (and admins), so a lender only ever
 * reads their own row.
 */
export async function getLenderProfile(): Promise<LenderRow | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("lender_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as LenderRow | null) ?? null;
}

/** True only when the current user is a lender with `verified` status. */
export async function isVerifiedLender(): Promise<boolean> {
  return (await getLenderVerificationStatus()) === "verified";
}

/** Where each role should land after login. */
export function dashboardPathFor(role: UserRole): string {
  switch (role) {
    case "borrower": return "/borrower/dashboard";
    case "lender": return "/lender/dashboard";
    case "admin": return "/admin";
    default: return "/";
  }
}
