"use server";

/**
 * Lender server actions: private-lender verification submission, and lender
 * settings.
 *
 * Two verification paths (see lib/licence-check.ts):
 *   * LICENSED lenders (broker/agent/bank/credit union/financing company) are
 *     verified from the licence number captured at signup via a backend check.
 *     They do NOT use submitLenderVerificationAction.
 *   * PRIVATE lenders have no licence, so they submit the verification form
 *     handled here (incorporated >1yr, no-upfront-fee, interest compliance,
 *     platform rules).
 *
 * Privacy/safety + verification model:
 *   * Writes go through the COOKIE-BOUND server client, so RLS (`lp_update`)
 *     limits a lender to their OWN row.
 *   * These actions NEVER set `verification_status`/`verification_notes`. The
 *     DB trigger `guard_lender_verification` rejects non-admin changes to them,
 *     so final verification stays admin-controlled.
 *   * A lender_profiles row always exists (created at signup) → UPDATE only.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { ROUTES, PROVINCES } from "@/lib/constants";
import type { Province, Database } from "@/types/database";

// Same postgrest `never`-widening workaround used in the borrower actions:
// build a properly-typed Update payload, cast only at the call boundary.
type LenderProfileUpdate = Database["public"]["Tables"]["lender_profiles"]["Update"];

const VERIFY = ROUTES.lenderVerification;
const SETTINGS = ROUTES.lenderSettings;

const PROVINCE_VALUES = PROVINCES.map((p) => p.value) as string[];

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function orNull(value: string): string | null {
  return value ? value : null;
}

function checked(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

/** Collect the selected provinces (checkbox group) into a validated array. */
function parseProvinces(formData: FormData): Province[] {
  const all = formData.getAll("operating_provinces").map((v) => String(v));
  const valid = all.filter((p) => PROVINCE_VALUES.includes(p));
  return valid as Province[];
}

/**
 * PRIVATE-LENDER verification submission. Licensed lenders never reach this.
 */
export async function submitLenderVerificationAction(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) fail(VERIFY, "You must be signed in.");

  const legalName = str(formData, "legal_name");
  const businessName = str(formData, "business_name");
  const businessEmail = str(formData, "business_email");
  const phone = str(formData, "phone");
  const website = str(formData, "website_or_social");
  const serviceArea = str(formData, "business_address_or_service_area");
  const operatingProvinces = parseProvinces(formData);

  const incorporatedOver1Year = checked(formData, "incorporated_over_1_year");
  const acceptsNoUpfrontFee = checked(formData, "accepts_no_upfront_fee_rule");
  const acceptsInterestCompliance = checked(formData, "accepts_interest_compliance");
  const acceptsPlatformRules = checked(formData, "accepts_platform_rules");
  const confirmsLegalResponsibility = checked(formData, "confirms_legal_responsibility");

  // Required core fields.
  if (!legalName) fail(VERIFY, "Legal name is required.");
  if (!businessName) fail(VERIFY, "Business name is required.");
  if (!businessEmail) fail(VERIFY, "Business email is required.");
  if (!phone) fail(VERIFY, "Phone is required.");
  if (operatingProvinces.length === 0) {
    fail(VERIFY, "Select at least one operating province.");
  }

  // Required confirmations (all apply to private lenders).
  if (!acceptsNoUpfrontFee) fail(VERIFY, "You must accept the no-upfront-fee rule.");
  if (!acceptsInterestCompliance) fail(VERIFY, "You must accept legal interest-rate compliance.");
  if (!acceptsPlatformRules) fail(VERIFY, "You must accept the platform posting rules.");
  if (!confirmsLegalResponsibility) {
    fail(VERIFY, "You must confirm you're responsible for your own licensing and legal compliance.");
  }

  const patch: LenderProfileUpdate = {
    legal_name: orNull(legalName),
    business_name: orNull(businessName),
    business_email: orNull(businessEmail),
    phone: orNull(phone),
    website_or_social: orNull(website),
    business_address_or_service_area: orNull(serviceArea),
    operating_provinces: operatingProvinces,
    is_private_lender: true,
    incorporated_over_1_year: incorporatedOver1Year,
    accepts_no_upfront_fee_rule: acceptsNoUpfrontFee,
    accepts_interest_compliance: acceptsInterestCompliance,
    accepts_platform_rules: acceptsPlatformRules,
    // Private lenders have no licence to check.
    licence_verification_status: "not_applicable",
    // NOTE: verification_status is intentionally NOT set — admin-controlled.
  };

  const { error } = await supabase
    .from("lender_profiles")
    .update(patch as never)
    .eq("user_id", user.id);
  if (error) fail(VERIFY, "Could not save your verification details. Please try again.");

  revalidatePath(ROUTES.lenderDashboard);
  redirect(
    `${ROUTES.lenderDashboard}?message=${encodeURIComponent(
      "Verification details submitted. An admin will review your account."
    )}`
  );
}

export async function updateLenderSettingsAction(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) fail(SETTINGS, "You must be signed in.");

  const businessName = str(formData, "business_name");
  const website = str(formData, "website_or_social");
  const serviceArea = str(formData, "business_address_or_service_area");
  const licenceNumber = str(formData, "licence_number");
  const operatingProvinces = parseProvinces(formData);

  if (!businessName) fail(SETTINGS, "Business name is required.");

  const patch: LenderProfileUpdate = {
    business_name: orNull(businessName),
    website_or_social: orNull(website),
    business_address_or_service_area: orNull(serviceArea),
    ...(operatingProvinces.length > 0 ? { operating_provinces: operatingProvinces } : {}),
    // Allow a lender to correct their licence number. NOTE: re-running the
    // backend licence check on update is a later step; for now updating the
    // number just stores it for admin review.
    ...(licenceNumber ? { licence_number: licenceNumber } : {}),
  };

  const { error } = await supabase
    .from("lender_profiles")
    .update(patch as never)
    .eq("user_id", user.id);
  if (error) fail(SETTINGS, "Could not save your settings. Please try again.");

  revalidatePath(SETTINGS);
  redirect(`${SETTINGS}?message=${encodeURIComponent("Your settings have been saved.")}`);
}
