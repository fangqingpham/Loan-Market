"use server";

/**
 * Borrower loan-request server actions: create, edit, delist, relist, and
 * borrower settings.
 *
 * Privacy/safety notes:
 *  - These write through the COOKIE-BOUND server client (not the admin client),
 *    so Row Level Security enforces that a borrower can only touch their own
 *    rows. We also verify ownership explicitly for clear error messages.
 *  - `loan_requests` has NO contact columns; contact info lives only in
 *    `profiles`, which is never read or written here.
 *  - Borrowers are never "verified"; there is no document upload anywhere.
 *  - Status transitions available to a borrower: active <-> delisted.
 *    `removed_by_admin` is admin-only and never set here.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { getBorrowerProfileId } from "@/lib/auth";
import { sanitizePublicTextWithResult } from "@/lib/privacy/sanitizePublicText";
import {
  ROUTES,
  LOAN_CATEGORIES,
  PROVINCES,
  SECURED_STATUS_OPTIONS,
} from "@/lib/constants";
import type {
  LoanCategory,
  Province,
  SecuredStatus,
  Database,
} from "@/types/database";

// postgrest-js (via @supabase/ssr) widens insert/update params to `never` for
// hand-written Database types in this version. We build a properly-typed payload
// (so the object is still validated against the table's Insert/Update shape) and
// cast only at the call boundary. Same class of type quirk noted for selects in
// lib/auth.ts.
type LoanRequestInsert = Database["public"]["Tables"]["loan_requests"]["Insert"];
type LoanRequestUpdate = Database["public"]["Tables"]["loan_requests"]["Update"];
type BorrowerProfileUpdate = Database["public"]["Tables"]["borrower_profiles"]["Update"];

const POST = ROUTES.borrowerPostRequest;
const LIST = ROUTES.borrowerMyRequests;

const LOAN_CATEGORY_VALUES = LOAN_CATEGORIES.map((c) => c.value) as string[];
const PROVINCE_VALUES = PROVINCES.map((p) => p.value) as string[];
const SECURED_VALUES = SECURED_STATUS_OPTIONS.map((o) => o.value) as string[];
const REDACTION_MESSAGE =
  "For privacy, direct contact details were hidden. Connections must go through approved contact requests.";

/** Redirect back to a page with an error message (never returns). */
function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function orNull(value: string): string | null {
  return value ? value : null;
}

/**
 * Pull and validate the shared loan-request fields from a submitted form.
 * Returns the column values ready for insert/update (errors via `fail`).
 */
function parseFields(formData: FormData, errorPath: string) {
  const loanCategory = str(formData, "loan_category");
  const province = str(formData, "province");
  const city = str(formData, "city");
  const amountRange = str(formData, "amount_range");
  const purposeCategory = str(formData, "purpose_category");
  const securedStatus = str(formData, "secured_status");

  const creditScoreRange = str(formData, "credit_score_range");
  const incomeRange = str(formData, "income_range");
  const employmentType = str(formData, "employment_type");
  const loanTermRange = str(formData, "loan_term_range");
  const expectedInterestRange = str(formData, "expected_interest_range");
  const borrowerNote = sanitizePublicTextWithResult(str(formData, "borrower_note"));

  // Required public-preview fields.
  if (!loanCategory) fail(errorPath, "Please choose a loan category.");
  if (!LOAN_CATEGORY_VALUES.includes(loanCategory)) fail(errorPath, "Invalid loan category.");
  if (!province) fail(errorPath, "Please choose a province.");
  if (!PROVINCE_VALUES.includes(province)) fail(errorPath, "Invalid province.");
  if (!amountRange) fail(errorPath, "Please choose an amount range.");
  if (securedStatus && !SECURED_VALUES.includes(securedStatus)) {
    fail(errorPath, "Invalid secured status.");
  }

  // Required safety acknowledgement.
  if (formData.get("agree") !== "on") {
    fail(errorPath, "You must acknowledge the posting warning before continuing.");
  }

  return {
    loan_category: loanCategory as LoanCategory,
    province: province as Province,
    city: orNull(city),
    amount_range: orNull(amountRange),
    purpose_category: orNull(purposeCategory),
    secured_status: securedStatus ? (securedStatus as SecuredStatus) : null,
    credit_score_range: orNull(creditScoreRange),
    income_range: orNull(incomeRange),
    employment_type: orNull(employmentType),
    loan_term_range: orNull(loanTermRange),
    expected_interest_range: orNull(expectedInterestRange),
    borrower_note: orNull(borrowerNote.text),
    publicTextRedacted: borrowerNote.redacted,
  };
}

export async function createLoanRequestAction(formData: FormData): Promise<void> {
  const borrowerId = await getBorrowerProfileId();
  if (!borrowerId) fail(POST, "Only borrowers can post a loan request.");

  const fields = parseFields(formData, POST);
  const { publicTextRedacted, ...loanFields } = fields;

  const supabase = createClient();
  const payload: LoanRequestInsert = {
    borrower_id: borrowerId,
    status: "active",
    ...loanFields,
  };
  const { error } = await supabase.from("loan_requests").insert(payload as never);
  if (error) fail(POST, "Could not post your request. Please try again.");

  revalidatePath(LIST);
  const message = publicTextRedacted
    ? `Your loan request is now active. ${REDACTION_MESSAGE}`
    : "Your loan request is now active.";
  redirect(`${LIST}?message=${encodeURIComponent(message)}`);
}

export async function updateLoanRequestAction(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  const editPath = `${LIST}/${id}/edit`;
  if (!id) fail(LIST, "Missing request id.");

  const borrowerId = await getBorrowerProfileId();
  if (!borrowerId) fail(editPath, "Only borrowers can edit a loan request.");

  const supabase = createClient();

  // Ownership check (RLS would also block, but this gives a clear message).
  const { data: existing } = await supabase
    .from("loan_requests")
    .select("borrower_id, status")
    .eq("id", id)
    .maybeSingle();
  const row = existing as { borrower_id: string; status: string } | null;
  if (!row || row.borrower_id !== borrowerId) fail(LIST, "Request not found.");
  if (row.status === "removed_by_admin") {
    fail(LIST, "This request was removed by an admin and can't be edited.");
  }

  const fields = parseFields(formData, editPath);
  const { publicTextRedacted, ...loanFields } = fields;
  const patch: LoanRequestUpdate = loanFields;

  const { error } = await supabase.from("loan_requests").update(patch as never).eq("id", id);
  if (error) fail(editPath, "Could not save your changes. Please try again.");

  revalidatePath(LIST);
  const message = publicTextRedacted
    ? `Your changes have been saved. ${REDACTION_MESSAGE}`
    : "Your changes have been saved.";
  redirect(`${LIST}?message=${encodeURIComponent(message)}`);
}

/** Shared status flip for delist/relist (borrower-controlled transitions only). */
async function setStatus(formData: FormData, next: "active" | "delisted", okMsg: string) {
  const id = str(formData, "id");
  if (!id) fail(LIST, "Missing request id.");

  const borrowerId = await getBorrowerProfileId();
  if (!borrowerId) fail(LIST, "Only borrowers can manage a loan request.");

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("loan_requests")
    .select("borrower_id, status")
    .eq("id", id)
    .maybeSingle();
  const row = existing as { borrower_id: string; status: string } | null;
  if (!row || row.borrower_id !== borrowerId) fail(LIST, "Request not found.");
  if (row.status === "removed_by_admin") {
    fail(LIST, "This request was removed by an admin.");
  }

  const patch: LoanRequestUpdate = { status: next };
  const { error } = await supabase.from("loan_requests").update(patch as never).eq("id", id);
  if (error) fail(LIST, "Could not update the request. Please try again.");

  revalidatePath(LIST);
  redirect(`${LIST}?message=${encodeURIComponent(okMsg)}`);
}

export async function delistLoanRequestAction(formData: FormData): Promise<void> {
  await setStatus(formData, "delisted", "Your request has been delisted and is now hidden from lenders.");
}

export async function relistLoanRequestAction(formData: FormData): Promise<void> {
  await setStatus(formData, "active", "Your request is active again.");
}

export async function updateBorrowerSettingsAction(formData: FormData): Promise<void> {
  const SETTINGS = ROUTES.borrowerSettings;
  const displayName = str(formData, "display_name");
  const city = str(formData, "city");
  const province = str(formData, "province");
  if (province && !PROVINCE_VALUES.includes(province)) fail(SETTINGS, "Invalid province.");

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) fail(SETTINGS, "You must be signed in.");

  const patch: BorrowerProfileUpdate = {
    display_name: orNull(displayName),
    city: orNull(city),
    province: province ? (province as Province) : null,
  };
  const { error } = await supabase
    .from("borrower_profiles")
    .update(patch as never)
    .eq("user_id", user.id);
  if (error) fail(SETTINGS, "Could not save your settings. Please try again.");

  revalidatePath(SETTINGS);
  redirect(`${SETTINGS}?message=${encodeURIComponent("Your settings have been saved.")}`);
}
