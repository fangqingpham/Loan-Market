"use server";

/**
 * Authentication server actions: login, borrower signup, lender signup, logout.
 *
 * Signup uses the service-role admin client to (1) create the auth user and
 * (2) create the matching profile rows, then signs the user in with the
 * cookie-bound server client so a session is established. Validation failures
 * redirect back to the form with an `?error=` message.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { dashboardPathFor } from "@/lib/auth";
import { checkLenderLicence } from "@/lib/licence-check";
import { PRIVATE_LENDERS_ENABLED, LICENSED_LENDER_TYPES, LICENCE_REQUIRED_LENDER_TYPES } from "@/lib/constants";
import type { UserRole, Province, LenderType } from "@/types/database";

const LOGIN = "/login";
const SIGNUP_BORROWER = "/signup/borrower";
const SIGNUP_LENDER = "/signup/lender";

/** Redirect back to a form with an error message (never returns). */
function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = str(formData, "email");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) fail(LOGIN, "Enter your email and password.");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) fail(LOGIN, "Invalid email or password.");

  let role: UserRole = "borrower";
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase
      .from("profiles").select("role").eq("user_id", user.id).maybeSingle();
    const row = data as { role: UserRole } | null;
    if (row?.role) role = row.role;
  }
  redirect(dashboardPathFor(role));
}

export async function signupBorrowerAction(formData: FormData): Promise<void> {
  const fullName = str(formData, "full_name");
  const email = str(formData, "email");
  const password = String(formData.get("password") ?? "");
  const phone = str(formData, "phone");
  const city = str(formData, "city");
  const province = str(formData, "province");
  const agree = formData.get("agree");

  if (!email || !password) fail(SIGNUP_BORROWER, "Email and password are required.");
  if (password.length < 8) fail(SIGNUP_BORROWER, "Password must be at least 8 characters.");
  if (agree !== "on") fail(SIGNUP_BORROWER, "You must agree to the Terms, Privacy Policy, and Disclaimer.");

  const admin = createAdminClient();
  if (!admin) fail(SIGNUP_BORROWER, "Sign-ups aren't available right now. Please try again later.");
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
    app_metadata: { role: "borrower" },
  });
  if (createError || !created?.user) {
    const dup = createError?.message?.toLowerCase().includes("already");
    fail(SIGNUP_BORROWER, dup ? "An account with this email already exists." : "Could not create your account. Please try again.");
  }
  const userId = created.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    user_id: userId, role: "borrower", full_name: fullName || null, email, phone: phone || null,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    fail(SIGNUP_BORROWER, "Could not set up your profile. Please try again.");
  }

  const { error: bpError } = await admin.from("borrower_profiles").insert({
    user_id: userId,
    display_name: fullName || null,
    city: city || null,
    province: province ? (province as Province) : null,
  });
  if (bpError) {
    await admin.auth.admin.deleteUser(userId);
    fail(SIGNUP_BORROWER, "Could not set up your borrower profile. Please try again.");
  }

  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect(`${LOGIN}?message=${encodeURIComponent("Account created. Please log in.")}`);
  }
  redirect("/borrower/dashboard");
}

export async function signupLenderAction(formData: FormData): Promise<void> {
  const email = str(formData, "email");
  const password = String(formData.get("password") ?? "");
  const legalName = str(formData, "legal_name");
  const businessName = str(formData, "business_name");
  const businessEmail = str(formData, "business_email") || email;
  const phone = str(formData, "phone");
  const website = str(formData, "website_or_social");
  const lenderType = str(formData, "lender_type");
  const brokerage = str(formData, "brokerage_or_company_name");
  const licenceNumber = str(formData, "licence_number");
  const province = str(formData, "province");
  const isPrivateLender = lenderType === "private_lender";
  const agree = formData.get("agree");
  const agreeRules = formData.get("agree_rules");

  if (!email || !password) fail(SIGNUP_LENDER, "Email and password are required.");
  if (password.length < 8) fail(SIGNUP_LENDER, "Password must be at least 8 characters.");
  if (!businessName) fail(SIGNUP_LENDER, "Business name is required.");
  if (!lenderType) fail(SIGNUP_LENDER, "Please select a lender type.");
  // Launch gate: only licensed lender types may register until private lenders
  // are enabled. Enforced server-side (not just hidden in the dropdown).
  if (!PRIVATE_LENDERS_ENABLED && !LICENSED_LENDER_TYPES.includes(lenderType as LenderType)) {
    fail(SIGNUP_LENDER, "Registration is currently open to licensed lenders only.");
  }
  // A licence number is required only for mortgage brokers and agents — the
  // only types that carry a personal/firm licence. Banks, credit unions, and
  // financing companies are authorized/registered instead, so they submit no
  // licence number. Mirrors the show/hide logic in the signup form.
  const requiresLicence = LICENCE_REQUIRED_LENDER_TYPES.includes(lenderType as LenderType);
  if (requiresLicence && !licenceNumber) {
    fail(SIGNUP_LENDER, "A licence number is required for mortgage brokers and agents.");
  }
  if (agree !== "on") fail(SIGNUP_LENDER, "You must agree to the Terms, Privacy Policy, and Disclaimer.");
  if (agreeRules !== "on") fail(SIGNUP_LENDER, "You must agree to the platform rules.");

  const admin = createAdminClient();
  if (!admin) fail(SIGNUP_LENDER, "Sign-ups aren't available right now. Please try again later.");
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: businessName },
    app_metadata: { role: "lender" },
  });
  if (createError || !created?.user) {
    const dup = createError?.message?.toLowerCase().includes("already");
    fail(SIGNUP_LENDER, dup ? "An account with this email already exists." : "Could not create your account. Please try again.");
  }
  const userId = created.user.id;

  // Run the (stubbed) backend licence check for licensed lender types. Private
  // lenders return 'not_applicable' and complete the verification form later.
  const licence = await checkLenderLicence({
    lenderType: lenderType ? (lenderType as LenderType) : null,
    licenceNumber: licenceNumber || null,
    provinces: province ? [province] : [],
  });

  const { error: profileError } = await admin.from("profiles").insert({
    user_id: userId, role: "lender", full_name: businessName || legalName || null, email, phone: phone || null,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    fail(SIGNUP_LENDER, "Could not set up your profile. Please try again.");
  }

  // Conduit model: Loan Market does NOT verify or endorse lenders. A licensed
  // lender who provides a licence number and accepts the rules is activated
  // immediately on signup (no manual review step). The licence number is shown
  // publicly as self-reported, and borrowers are directed to confirm it with
  // the regulator themselves. Private lenders (not enabled at launch) would
  // still go through the form/admin path, so they remain pending.
  const initialStatus = isPrivateLender ? "pending_verification" : "verified";

  const { error: lpError } = await admin.from("lender_profiles").insert({
    user_id: userId,
    legal_name: legalName || null,
    business_name: businessName || null,
    business_email: businessEmail || null,
    phone: phone || null,
    website_or_social: website || null,
    lender_type: lenderType ? (lenderType as LenderType) : null,
    licence_number: licenceNumber || null,
    brokerage_or_company_name: brokerage || null,
    operating_provinces: province ? [province as Province] : [],
    verification_status: initialStatus,
    is_private_lender: isPrivateLender,
    licence_verification_status: licence.status,
    licence_checked_at: licence.checkedAt,
    licence_check_message: licence.message,
    accepts_platform_rules: true,
  });
  if (lpError) {
    await admin.auth.admin.deleteUser(userId);
    fail(SIGNUP_LENDER, "Could not set up your lender profile. Please try again.");
  }

  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect(`${LOGIN}?message=${encodeURIComponent("Account created. Please log in.")}`);
  }
  redirect("/lender/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
