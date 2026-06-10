"use server";

/**
 * Lender-side contact-request actions: REQUEST a borrower's contact, and CANCEL
 * a pending request.
 *
 * All business logic lives in SECURITY DEFINER database functions (Stage 2):
 *   - request_loan_request_contact(p_loan_request_id) — checks is_verified_lender,
 *     blocks duplicate active requests for the same loan request, creates a
 *     'pending' contact_request. No contact info is exposed.
 *   - cancel_contact_request(p_request_id) — requester-only.
 * We just call them through the cookie-bound client (so auth.uid() is the
 * lender) and translate raised exceptions into friendly messages.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { ROUTES, DAILY_CONTACT_LIMIT_MESSAGE } from "@/lib/constants";
import type { Database } from "@/types/database";

const BOARD = ROUTES.loanRequests;
const LENDER_CR = ROUTES.lenderContactRequests;

type ProfileRole = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;
type LenderStatus = Pick<Database["public"]["Tables"]["lender_profiles"]["Row"], "id" | "verification_status">;
type LoanRequestStatus = Pick<Database["public"]["Tables"]["loan_requests"]["Row"], "id" | "status">;
type ExistingContact = Pick<Database["public"]["Tables"]["contact_requests"]["Row"], "id" | "status">;

function backWith(path: string, key: "message" | "error", text: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(text)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function logContactError(context: string, error: unknown): void {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[requestContactAction] ${context}`, error);
  }
}

/**
 * After an approval, look up the conversation just opened for this contact
 * request and redirect into its thread. Returns (no redirect) if none exists.
 */
async function redirectToConversation(requestId: string): Promise<void> {
  const supabase = createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("contact_request_id", requestId)
    .maybeSingle();
  const conv = data as { id: string } | null;
  if (conv?.id) {
    redirect(`${ROUTES.messages}/${conv.id}`);
  }
}

/**
 * Map a Postgres error raised by the RPC to a friendly, user-facing message.
 * The DB functions raise specific text we can match on.
 */
function friendly(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("not authenticated") || m.includes("jwt")) {
    return "Please log in as a verified lender to contact borrowers.";
  }
  if (m.includes("daily_contact_limit_reached")) {
    return DAILY_CONTACT_LIMIT_MESSAGE;
  }
  if (m.includes("insufficient_credits")) {
    return "You don't have enough credits to contact this borrower. Please buy more credits and try again.";
  }
  if (m.includes("only verified lenders")) {
    return "Your lender profile must be verified before requesting contact.";
  }
  if (m.includes("already exists")) {
    return "You already requested contact for this borrower.";
  }
  if (m.includes("not found") || m.includes("not active")) {
    return "That loan request is no longer available.";
  }
  if (m.includes("not allowed")) {
    return "Contact is not allowed for this request.";
  }
  if (m.includes("lender_contact_credits_enabled")) {
    return "Marketplace contact settings are not fully configured yet. Please try again shortly.";
  }
  if (m.includes("row-level security") || m.includes("permission denied")) {
    return "Please log in as a verified lender to contact borrowers.";
  }
  return "Could not complete that action. Please try again.";
}

export async function requestContactAction(formData: FormData): Promise<void> {
  const loanRequestId = str(formData, "loan_request_id");
  // Where to send the user back to (defaults to the board).
  const returnTo = str(formData, "return_to") || BOARD;
  if (!loanRequestId) backWith(returnTo, "error", "Missing loan request.");

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) logContactError("auth.getUser failed", userError);
  if (!user) backWith(returnTo, "error", "Please log in as a verified lender to contact borrowers.");

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) {
    logContactError("profile lookup failed", profileError);
    backWith(returnTo, "error", friendly(profileError.message));
  }
  const profile = profileData as ProfileRole | null;
  if (profile?.role !== "lender") {
    backWith(returnTo, "error", "Please log in as a verified lender to contact borrowers.");
  }

  const { data: lenderData, error: lenderError } = await supabase
    .from("lender_profiles")
    .select("id, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (lenderError) {
    logContactError("lender profile lookup failed", lenderError);
    backWith(returnTo, "error", friendly(lenderError.message));
  }
  const lender = lenderData as LenderStatus | null;
  if (!lender) {
    backWith(returnTo, "error", "Please log in as a verified lender to contact borrowers.");
  }
  if (lender.verification_status !== "verified") {
    backWith(returnTo, "error", "Your lender profile must be verified before requesting contact.");
  }

  const { data: loanData, error: loanError } = await supabase
    .from("loan_requests")
    .select("id, status")
    .eq("id", loanRequestId)
    .maybeSingle();
  if (loanError) {
    logContactError("loan request lookup failed", loanError);
    backWith(returnTo, "error", friendly(loanError.message));
  }
  const loanRequest = loanData as LoanRequestStatus | null;
  if (!loanRequest || loanRequest.status !== "active") {
    backWith(returnTo, "error", "This borrower request is no longer available.");
  }

  const { data: existingData, error: existingError } = await supabase
    .from("contact_requests")
    .select("id, status")
    .eq("direction", "lender_to_borrower")
    .eq("lender_id", lender.id)
    .eq("loan_request_id", loanRequestId)
    .in("status", ["pending", "approved_pending_payment", "approved"])
    .maybeSingle();
  if (existingError) {
    logContactError("duplicate contact lookup failed", existingError);
    backWith(returnTo, "error", friendly(existingError.message));
  }
  const existing = existingData as ExistingContact | null;
  if (existing) {
    backWith(returnTo, "error", "You already requested contact for this borrower.");
  }

  const { error } = await supabase.rpc("request_loan_request_contact", {
    p_loan_request_id: loanRequestId,
  } as never);

  if (error) {
    logContactError("request_loan_request_contact failed", error);
    backWith(returnTo, "error", friendly(error.message));
  }

  revalidatePath(returnTo);
  revalidatePath(LENDER_CR);
  backWith(
    returnTo,
    "message",
    "Request sent successfully. The borrower will review your request."
  );
}

export async function cancelContactAction(formData: FormData): Promise<void> {
  const requestId = str(formData, "request_id");
  if (!requestId) backWith(LENDER_CR, "error", "Missing request id.");

  const supabase = createClient();
  const { error } = await supabase.rpc("cancel_contact_request", {
    p_request_id: requestId,
  } as never);

  if (error) backWith(LENDER_CR, "error", friendly(error.message));

  revalidatePath(LENDER_CR);
  backWith(LENDER_CR, "message", "Contact request cancelled.");
}

/**
 * INCOMING borrower→lender requests (from the product board "Contact This
 * Lender" button). Here the LENDER is the recipient, so the lender approves or
 * rejects. The RPCs are recipient-only and enforce that. For borrower→lender
 * there is no weekly cap. Approval opens a conversation (free path while
 * listing-contact payment is disabled).
 */
function friendlyRespond(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("only the recipient")) {
    return "You can only respond to requests addressed to you.";
  }
  if (m.includes("only pending")) {
    return "This request has already been handled.";
  }
  return "Could not complete that action. Please try again.";
}

export async function approveListingContactAction(formData: FormData): Promise<void> {
  const requestId = str(formData, "request_id");
  if (!requestId) backWith(LENDER_CR, "error", "Missing request id.");

  const supabase = createClient();
  const { data, error } = await supabase.rpc("approve_contact_request", {
    p_request_id: requestId,
  } as never);
  if (error) backWith(LENDER_CR, "error", friendlyRespond(error.message));

  revalidatePath(LENDER_CR);

  // If listing-contact payment is enabled, approving a borrower→lender request
  // yields 'approved_pending_payment' and NO conversation opens until the
  // borrower pays. Otherwise it's 'approved' and a thread opens now.
  const status = data as unknown as string | null;
  if (status === "approved_pending_payment") {
    backWith(
      LENDER_CR,
      "message",
      "Approved. The borrower has been asked to pay the platform communication fee; messaging opens once they pay."
    );
  }

  // Free path — take the lender straight into the newly opened thread.
  await redirectToConversation(requestId);
  backWith(LENDER_CR, "message", "Request approved. A message thread is now open.");
}

export async function rejectListingContactAction(formData: FormData): Promise<void> {
  const requestId = str(formData, "request_id");
  if (!requestId) backWith(LENDER_CR, "error", "Missing request id.");

  const supabase = createClient();
  const { error } = await supabase.rpc("reject_contact_request", {
    p_request_id: requestId,
  } as never);
  if (error) backWith(LENDER_CR, "error", friendlyRespond(error.message));

  revalidatePath(LENDER_CR);
  backWith(LENDER_CR, "message", "Request declined.");
}
