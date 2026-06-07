"use server";

/**
 * Lender product-listing actions: create, edit, delist, relist.
 *
 * Privacy/safety + access model:
 *  - Writes go through the COOKIE-BOUND client, so RLS enforces the rules:
 *    `ll_insert` requires `is_verified_lender()` AND ownership of the lender
 *    profile; `ll_update`/`ll_delete` are owner-or-admin. A non-verified or
 *    non-owner lender is blocked at the database.
 *  - `lender_listings` has NO contact columns by design — there is nothing here
 *    that could leak a phone/email/website. Connection happens only through an
 *    approved conversation.
 *  - Status transitions available to a lender: active <-> delisted.
 *    `removed_by_admin` is admin-only and never set here.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { getLenderProfile } from "@/lib/auth";
import { sanitizePublicTextWithResult } from "@/lib/privacy/sanitizePublicText";
import { ROUTES, LOAN_CATEGORIES, SECURED_STATUS_OPTIONS } from "@/lib/constants";
import type { LoanCategory, SecuredStatus, Database } from "@/types/database";

type ListingInsert = Database["public"]["Tables"]["lender_listings"]["Insert"];
type ListingUpdate = Database["public"]["Tables"]["lender_listings"]["Update"];

const POST = ROUTES.lenderPostProduct;
const LIST = ROUTES.lenderProducts;

const LOAN_CATEGORY_VALUES = LOAN_CATEGORIES.map((c) => c.value) as string[];
const SECURED_VALUES = SECURED_STATUS_OPTIONS.map((o) => o.value) as string[];
const REDACTION_MESSAGE =
  "For privacy, direct contact details were hidden. Connections must go through approved contact requests.";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function orNull(value: string): string | null {
  return value ? value : null;
}

/** Parse + validate the shared product fields (errors via `fail`). */
function parseFields(formData: FormData, errorPath: string) {
  const productTitle = str(formData, "product_title");
  const loanCategory = str(formData, "loan_category");
  const serviceArea = str(formData, "service_area");
  const amountRange = str(formData, "amount_range");
  const termRange = str(formData, "term_range");
  const rateRange = str(formData, "rate_range");
  const securedStatus = str(formData, "secured_status");
  const productDescription = sanitizePublicTextWithResult(str(formData, "product_description"));
  const importantConditions = sanitizePublicTextWithResult(str(formData, "important_conditions"));

  if (!productTitle) fail(errorPath, "Please enter a product title.");
  if (productTitle.length > 120) fail(errorPath, "Product title is too long.");
  if (!loanCategory) fail(errorPath, "Please choose a loan category.");
  if (!LOAN_CATEGORY_VALUES.includes(loanCategory)) fail(errorPath, "Invalid loan category.");
  if (securedStatus && !SECURED_VALUES.includes(securedStatus)) {
    fail(errorPath, "Invalid secured status.");
  }

  return {
    product_title: productTitle,
    loan_category: loanCategory as LoanCategory,
    service_area: orNull(serviceArea),
    amount_range: orNull(amountRange),
    term_range: orNull(termRange),
    rate_range: orNull(rateRange),
    secured_status: securedStatus ? (securedStatus as SecuredStatus) : null,
    product_description: orNull(productDescription.text),
    important_conditions: orNull(importantConditions.text),
    publicTextRedacted: productDescription.redacted || importantConditions.redacted,
  };
}

export async function createProductAction(formData: FormData): Promise<void> {
  const lender = await getLenderProfile();
  if (!lender) fail(POST, "Only lenders can post a product.");
  if (lender.verification_status !== "verified") {
    fail(POST, "Only verified lenders can post products.");
  }

  const fields = parseFields(formData, POST);
  const { publicTextRedacted, ...listingFields } = fields;

  const supabase = createClient();
  const payload: ListingInsert = {
    lender_id: lender.id,
    status: "active",
    ...listingFields,
  };
  const { error } = await supabase.from("lender_listings").insert(payload as never);
  if (error) fail(POST, "Could not post your product. Please try again.");

  revalidatePath(LIST);
  const message = publicTextRedacted
    ? `Your product listing is now active. ${REDACTION_MESSAGE}`
    : "Your product listing is now active.";
  redirect(`${LIST}?message=${encodeURIComponent(message)}`);
}

export async function updateProductAction(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  const editPath = `${LIST}/${id}/edit`;
  if (!id) fail(LIST, "Missing product id.");

  const lender = await getLenderProfile();
  if (!lender) fail(editPath, "Only lenders can edit a product.");

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("lender_listings")
    .select("lender_id, status")
    .eq("id", id)
    .maybeSingle();
  const row = existing as { lender_id: string; status: string } | null;
  if (!row || row.lender_id !== lender.id) fail(LIST, "Product not found.");
  if (row.status === "removed_by_admin") {
    fail(LIST, "This product was removed by an admin and can't be edited.");
  }

  const fields = parseFields(formData, editPath);
  const { publicTextRedacted, ...listingFields } = fields;
  const patch: ListingUpdate = listingFields;
  const { error } = await supabase.from("lender_listings").update(patch as never).eq("id", id);
  if (error) fail(editPath, "Could not save your changes. Please try again.");

  revalidatePath(LIST);
  const message = publicTextRedacted
    ? `Your changes have been saved. ${REDACTION_MESSAGE}`
    : "Your changes have been saved.";
  redirect(`${LIST}?message=${encodeURIComponent(message)}`);
}

/** Shared status flip for delist/relist (lender-controlled transitions only). */
async function setStatus(formData: FormData, next: "active" | "delisted", okMsg: string) {
  const id = str(formData, "id");
  if (!id) fail(LIST, "Missing product id.");

  const lender = await getLenderProfile();
  if (!lender) fail(LIST, "Only lenders can manage a product.");

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("lender_listings")
    .select("lender_id, status")
    .eq("id", id)
    .maybeSingle();
  const row = existing as { lender_id: string; status: string } | null;
  if (!row || row.lender_id !== lender.id) fail(LIST, "Product not found.");
  if (row.status === "removed_by_admin") {
    fail(LIST, "This product was removed by an admin.");
  }

  const patch: ListingUpdate = { status: next };
  const { error } = await supabase.from("lender_listings").update(patch as never).eq("id", id);
  if (error) fail(LIST, "Could not update the product. Please try again.");

  revalidatePath(LIST);
  redirect(`${LIST}?message=${encodeURIComponent(okMsg)}`);
}

export async function delistProductAction(formData: FormData): Promise<void> {
  await setStatus(formData, "delisted", "Your product has been delisted and is hidden from borrowers.");
}

export async function relistProductAction(formData: FormData): Promise<void> {
  await setStatus(formData, "active", "Your product is active again.");
}
